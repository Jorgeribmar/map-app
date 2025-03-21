export type MapStyle = 'standard' | 'satellite' | 'terrain' | 'dark';
interface MapStyleControlProps {
    style: MapStyle;
    onStyleChange: (style: MapStyle) => void;
}
declare const MapStyleControl: ({ style, onStyleChange }: MapStyleControlProps) => import("react/jsx-runtime").JSX.Element;
export default MapStyleControl;
