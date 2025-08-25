export interface TextBlock {
  id: number;
  text: string;
  confidence: number;
  bbox: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
    width: number;
    height: number;
  };
  polygon: [number, number][];
}

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
}

export interface OCRResult {
  full_text: string;
  text_blocks: TextBlock[];
  image_info: ImageInfo;
}

export interface OCRResponse {
  full_text: string;
  text_blocks: TextBlock[];
  image_info: ImageInfo;
}