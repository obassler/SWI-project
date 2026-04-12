import React from 'react';

export default function SearchSortBar({ searchTerm, onSearchChange, sortField, sortDirection, onSort, sortOptions }) {
    return (
        <div className="flex flex-wrap gap-2 items-center bg-gray-700 p-3 rounded">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="flex-1 min-w-[200px] p-2 bg-gray-600 text-white rounded placeholder-gray-400"
            />
            <div className="flex gap-1 text-xs flex-wrap">
                <span className="text-gray-400 self-center mr-1">Sort:</span>
                {sortOptions.map(([field, label]) => (
                    <button
                        key={field}
                        onClick={() => onSort(field)}
                        className={`px-2 py-1 rounded transition ${
                            sortField === field ? 'bg-yellow-600 text-black font-semibold' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                    >
                        {label} {sortField === field ? (sortDirection === 'asc' ? '\u2191' : '\u2193') : ''}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function useSearchSort(defaultField = 'name') {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortField, setSortField] = React.useState(defaultField);
    const [sortDirection, setSortDirection] = React.useState('asc');

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filterAndSort = (items, searchFields) => {
        const term = searchTerm.toLowerCase();
        return items
            .filter(item => {
                if (!term) return true;
                return searchFields.some(field => {
                    const val = typeof field === 'function' ? field(item) : item[field];
                    return val && String(val).toLowerCase().includes(term);
                });
            })
            .sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];
                if (aVal == null) aVal = '';
                if (bVal == null) bVal = '';
                const dir = sortDirection === 'asc' ? 1 : -1;
                if (typeof aVal === 'boolean') return ((aVal === bVal) ? 0 : aVal ? -1 : 1) * dir;
                if (typeof aVal === 'number' || (typeof aVal === 'string' && !isNaN(Number(aVal)) && aVal !== '')) {
                    return (Number(aVal) - Number(bVal)) * dir;
                }
                return String(aVal).localeCompare(String(bVal)) * dir;
            });
    };

    return { searchTerm, setSearchTerm, sortField, sortDirection, handleSort, filterAndSort };
}
