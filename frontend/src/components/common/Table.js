import React from 'react';

const Table = ({
    headers,
    data,
    className = '',
    onRowClick,
    loading = false,
    emptyMessage = 'No data available',
    striped = true,
    hoverable = true,
    ...props
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-background-200">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-8 bg-background-200 rounded-xl w-full"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-soft p-12 text-center border border-background-200">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">No Data Available</h3>
                <p className="text-text-secondary">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-background-200">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gradient-to-r from-background-50 to-background-100 border-b border-background-200">
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    className="py-5 px-6 text-left font-bold text-text-primary text-base"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={`border-b border-background-100 transition-all duration-300 ease-out ${striped && rowIndex % 2 === 1 ? 'bg-background-50' : ''
                                    } ${hoverable && onRowClick ? 'hover:bg-primary-50 hover:shadow-sm cursor-pointer' : ''
                                    }`}
                                onClick={() => onRowClick && onRowClick(row, rowIndex)}
                            >
                                {Object.values(row).map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className="py-5 px-6 text-text-primary text-base"
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;
