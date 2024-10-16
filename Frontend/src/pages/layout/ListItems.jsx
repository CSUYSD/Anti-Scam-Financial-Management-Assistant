import * as React from 'react';
import { ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { NavLink } from "react-router-dom";
import {
    Dashboard as DashboardIcon,
    AttachMoney as AttachMoneyIcon,
    BarChart as BarChartIcon,
    AccountBalance as AccountBalanceIcon,
    ContactSupport as ContactSupportIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    margin: '4px 8px',
    '&.active': {
        backgroundColor: theme.palette.action.selected,
        '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
        },
        '& .MuiListItemText-primary': {
            fontWeight: 600,
            color: theme.palette.text.primary,
        },
    },
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
    minWidth: 40,
    color: theme.palette.text.secondary,
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    '& .MuiListItemText-primary': {
        fontSize: '0.875rem',
        fontWeight: 500,
    },
}));

const StyledListSubheader = styled(ListSubheader)(({ theme }) => ({
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.5px',
    color: theme.palette.text.secondary,
    lineHeight: '2.5em',
    backgroundColor: 'transparent',
}));

export const mainListItems = (
    <React.Fragment>
        <StyledListItemButton component={NavLink} to="/">
            <StyledListItemIcon>
                <DashboardIcon />
            </StyledListItemIcon>
            <StyledListItemText primary="Dashboard" />
        </StyledListItemButton>
        <StyledListItemButton component={NavLink} to="/transaction">
            <StyledListItemIcon>
                <AttachMoneyIcon/>
            </StyledListItemIcon>
            <StyledListItemText primary="Transaction" />
        </StyledListItemButton>
        <StyledListItemButton component={NavLink} to="/report">
            <StyledListItemIcon>
                <BarChartIcon />
            </StyledListItemIcon>
            <StyledListItemText primary="Reports" />
        </StyledListItemButton>
        <StyledListItemButton component={NavLink} to="/investment">
            <StyledListItemIcon>
                <AccountBalanceIcon />
            </StyledListItemIcon>
            <StyledListItemText primary="Investment" />
        </StyledListItemButton>
        <StyledListItemButton component={NavLink} to="/contact-us">
            <StyledListItemIcon>
                <ContactSupportIcon />
            </StyledListItemIcon>
            <StyledListItemText primary="Contact Us" />
        </StyledListItemButton>
    </React.Fragment>
);

export const secondaryListItems = (
    <React.Fragment>
        <StyledListSubheader component="div" inset>
            Additional Features
        </StyledListSubheader>
        {/* Uncomment and modify as needed
        <StyledListItemButton component={NavLink} to="/current-month">
            <StyledListItemIcon>
                <AssignmentIcon />
            </StyledListItemIcon>
            <StyledListItemText primary="Current month" />
        </StyledListItemButton>
        */}
    </React.Fragment>
);