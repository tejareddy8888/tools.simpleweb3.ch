import { styled } from '@mui/system';
import { Alert, ThemeProvider, AlertTitle } from '@mui/material';
import React from 'react';
import { customAlertTheme } from '../../styles/customAlertTheme';
import { chainIdToChainIcon } from '../../web3/networks/mapChainIdtoIcon';

const CustomAlert = styled(Alert)(({ theme }) => ({
    backgroundColor: 'transparent', // Make background transparent
    color: theme.palette.warning.main, // Use the warning color for text
    border: `0px solid ${theme.palette.warning.main}`, // Add a border with the warning color
    '& .MuiAlert-icon': {
        alignItems: 'center',
        color: theme.palette.warning.main, // Set icon color to match text
    },
    '& .MuiAlert-message': {
        width: '100%', // Ensure the message takes full width
    },
}));

const AddressSpan = styled('span')({
    wordBreak: 'break-all', // This will break the address at any character
    display: 'inline-block',
    width: '100%',
});

export const CustomNetworkAlert = ({ chainId, address }) => {
    return (
        <ThemeProvider theme={customAlertTheme}>
            <CustomAlert
                icon={<img src={chainIdToChainIcon.get(chainId)} style={{ width: 45, height: 45 }} alt="Chain Icon" />}
                severity="warning" // This ensures we're using the warning palette
            >
                <AlertTitle>Address In Use:</AlertTitle>
                <AddressSpan>{address}</AddressSpan>
            </CustomAlert>
        </ThemeProvider>
    );
};

export default CustomNetworkAlert;