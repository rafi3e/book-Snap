
declare module 'react-easy-crop' {
    import { CSSProperties, Component } from 'react';
  
    export interface Point {
      x: number;
      y: number;
    }
  
    export interface Size {
      width: number;
      height: number;
    }
  
    export interface Area {
      width: number;
      height: number;
      x: number;
      y: number;
    }
  
    export interface CropperProps {
      image: string;
      crop: Point;
      zoom?: number;
      aspect?: number;
      minZoom?: number;
      maxZoom?: number;
      cropShape?: 'rect' | 'round';
      cropSize?: Size;
      showGrid?: boolean;
      zoomSpeed?: number;
      zoomWithScroll?: boolean;
      onCropChange: (location: Point) => void;
      onCropComplete?: (croppedArea: Area, croppedAreaPixels: Area) => void;
      onZoomChange?: (zoom: number) => void;
      style?: {
        containerStyle?: CSSProperties;
        imageStyle?: CSSProperties;
        cropAreaStyle?: CSSProperties;
      };
      classes?: {
        containerClassName?: string;
        imageClassName?: string;
        cropAreaClassName?: string;
      };
      [key: string]: any;
    }
  
    export default class Cropper extends Component<CropperProps> {}
  }
  