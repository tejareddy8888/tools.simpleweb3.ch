import { styled } from '@mui/system';
import { AlertTitle } from '@mui/material';
import React from 'react';

const AddressSpan = styled('span')({
    wordBreak: 'break-all',
    display: 'inline-block',
    width: '100%',
});

export const CustomNetworkAlert = ({ chainId, address }) => {
    return (
        <div className="relative">
            {/* Pixel Flicker Corners */}
            <div className="absolute top-0 left-0 w-4 h-4 bg-black flicker flicker-delay-2" />
            <div className="absolute top-0 right-0 w-4 h-4 bg-black flicker flicker-delay-2" />
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-black flicker flicker-delay-2" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-black flicker flicker-delay-2" />

            <div
                className="bg-white p-4 border-[4px] border-black"
                style={{
                    imageRendering: 'pixelated',
                    fontFamily: '"Press Start 2P", monospace',
                    boxShadow: '8px 8px 0 #000',
                }}
            >
                <AlertTitle className="text-black text-xs">Address In Use:</AlertTitle>
                <AddressSpan className="text-xs">{address}</AddressSpan>

                <div className="mt-4">
                    <h3 className="mb-4 text-xs font-bold text-black uppercase">Transaction Type</h3>
                    <ul className="w-full text-xs font-bold bg-white border-[3px] border-black sm:flex">
                        {[
                            { id: 'license', label: 'Legacy (Type 0)' },
                            { id: 'id', label: 'EIP-1559 (Type 2)' },
                            { id: 'military', label: 'EIP-2930 (Type 1)' },
                        ].map((item) => (
                            <li
                                key={item.id}
                                className="w-full border-b-[3px] border-black sm:border-b-0 sm:border-r-[3px] last:border-r-0"
                            >
                                <div className="flex items-center px-2 py-2 bg-gray-100 hover:bg-yellow-100 transition">
                                    <input
                                        id={`horizontal-list-radio-${item.id}`}
                                        type="radio"
                                        name="list-radio"
                                        className="w-4 h-4 border-[2px] border-black bg-white"
                                    />
                                    <label
                                        htmlFor={`horizontal-list-radio-${item.id}`}
                                        className="ml-3 text-black"
                                    >
                                        {item.label}
                                    </label>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CustomNetworkAlert;
