import { SearchResult } from '../types';
interface SearchBarProps {
    onSelect: (result: SearchResult | null) => void;
}
declare const SearchBar: ({ onSelect }: SearchBarProps) => import("react/jsx-runtime").JSX.Element;
export default SearchBar;
