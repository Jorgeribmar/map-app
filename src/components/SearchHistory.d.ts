import { SearchResult } from '../types';
interface SearchHistoryProps {
    searches: SearchResult[];
    onSelect: (result: SearchResult) => void;
    onClear: (result: SearchResult) => void;
    isOpen: boolean;
    onClose: () => void;
}
declare const SearchHistory: ({ searches, onSelect, onClear, isOpen, onClose }: SearchHistoryProps) => import("react/jsx-runtime").JSX.Element;
export default SearchHistory;
