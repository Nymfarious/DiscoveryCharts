import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import JSZip from 'https://esm.sh/jszip@3.10.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessedFile {
  fileName: string;
  storagePath: string;
  width: number;
  height: number;
  format: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const zipFile = formData.get('file') as File;
    const mapType = formData.get('mapType') as 'base' | 'overlay';
    const region = formData.get('region') as string;
    const year = formData.get('year') as string;
    const theme = formData.get('theme') as string | null;

    if (!zipFile) {
      return new Response(
        JSON.stringify({ error: 'No ZIP file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ZIP: ${zipFile.name}, type: ${mapType}, region: ${region}, year: ${year}`);

    // Read ZIP file as ArrayBuffer
    const zipBuffer = await zipFile.arrayBuffer();

    // Extract files from ZIP using JSZip
    const zip = await JSZip.loadAsync(zipBuffer);
    const processedFiles: ProcessedFile[] = [];
    const bucket = mapType === 'base' ? 'base_maps' : 'overlays';

    let index = 0;
    const fileEntries = Object.keys(zip.files);
    
    for (const fileName of fileEntries) {
      const entry = zip.files[fileName];
      
      // Skip directories and non-image files
      if (entry.dir || !isImageFile(fileName)) {
        console.log(`Skipping: ${fileName}`);
        continue;
      }

      console.log(`Processing: ${fileName}`);

      // Get file data as ArrayBuffer
      const fileData = await entry.async('arraybuffer');
      const blob = new Blob([fileData]);

      // Extract image metadata
      const metadata = await extractImageMetadata(blob);
      
      // Generate normalized path
      const normalizedPath = generateNormalizedPath(mapType, region, year, theme, index);
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(normalizedPath, blob, {
          upsert: true,
          contentType: metadata.contentType,
        });

      if (uploadError) {
        console.error(`Upload failed for ${fileName}:`, uploadError);
        continue;
      }

      console.log(`Uploaded: ${normalizedPath}`);

      // Insert metadata into database
      if (mapType === 'base') {
        const { error: dbError } = await supabase.from('base_maps').insert({
          title: fileName,
          region: region || 'Unknown',
          file_path: normalizedPath,
          attribution: `${metadata.width}x${metadata.height}px • ${metadata.format}`,
        });
        
        if (dbError) console.error('DB insert failed:', dbError);
      } else {
        // For overlays, find a matching base map or use placeholder
        const { data: baseMap } = await supabase
          .from('base_maps')
          .select('id')
          .eq('region', region)
          .limit(1)
          .single();

        const { error: dbError } = await supabase.from('overlays').insert({
          base_map_id: baseMap?.id || '00000000-0000-0000-0000-000000000000',
          theme: theme || 'General',
          year: parseInt(year) || 0,
          file_path: normalizedPath,
          notes: JSON.stringify({
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            region: region,
            originalFileName: fileName,
          }),
        });

        if (dbError) console.error('DB insert failed:', dbError);
      }

      processedFiles.push({
        fileName,
        storagePath: normalizedPath,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      });

      index++;
    }

    console.log(`Successfully processed ${processedFiles.length} files`);

    return new Response(
      JSON.stringify({
        success: true,
        processedCount: processedFiles.length,
        files: processedFiles,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing ZIP:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process ZIP';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function isImageFile(fileName: string): boolean {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff', '.gif'];
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}

function generateNormalizedPath(
  mapType: 'base' | 'overlay',
  region: string,
  year: string,
  theme: string | null,
  index: number
): string {
  if (mapType === 'base') {
    return `base_maps/${region}_${year}_${index}.png`;
  } else {
    return `overlays/${region}/${theme || 'General'}/${year}_${index}.png`;
  }
}

async function extractImageMetadata(blob: Blob): Promise<{
  width: number;
  height: number;
  format: string;
  contentType: string;
}> {
  // Create a temporary image to get dimensions
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Detect format from magic bytes
  let format = 'unknown';
  let contentType = 'application/octet-stream';
  
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    format = 'PNG';
    contentType = 'image/png';
  } else if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    format = 'JPEG';
    contentType = 'image/jpeg';
  } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    format = 'GIF';
    contentType = 'image/gif';
  } else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    format = 'WEBP';
    contentType = 'image/webp';
  }

  // Try to extract dimensions from PNG
  let width = 0;
  let height = 0;

  if (format === 'PNG' && bytes.length > 24) {
    // PNG IHDR chunk starts at byte 16
    width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
    height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
  } else if (format === 'JPEG') {
    // Parse JPEG for dimensions (simplified)
    for (let i = 0; i < bytes.length - 9; i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0xC0) {
        height = (bytes[i + 5] << 8) | bytes[i + 6];
        width = (bytes[i + 7] << 8) | bytes[i + 8];
        break;
      }
    }
  }

  return { width, height, format, contentType };
}
