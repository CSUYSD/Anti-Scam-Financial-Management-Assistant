import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import {NavLink} from "react-router-dom";

const activeStyle = {
    textDecoration: "none",
    color: "inherit",
    '&.active': {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        '& .MuiListItemIcon-root': {
            color: 'inherit',
        }
    }
};

export const mainListItems = (
    <React.Fragment>
        <ListItemButton component={NavLink} to="/" sx={activeStyle}>
            <ListItemIcon>
                <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton component={NavLink} to="/transaction" sx={activeStyle}>
            <ListItemIcon>
                <AttachMoneyIcon/>
            </ListItemIcon>
            <ListItemText primary="Transaction" />
        </ListItemButton>
        <ListItemButton component={NavLink} to="/report" sx={activeStyle}>
            <ListItemIcon>
                <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Reports" />
        </ListItemButton>
        <ListItemButton component={NavLink} to="/investment" sx={activeStyle}>
            <ListItemIcon>
                <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText primary="Investment" />
        </ListItemButton>
        <ListItemButton component={NavLink} to="/contact-us" sx={activeStyle}>
            <ListItemIcon>
                <ContactSupportIcon />
            </ListItemIcon>
            <ListItemText primary="Contact Us" />
        </ListItemButton>
    </React.Fragment>
);

export const secondaryListItems = (
    <React.Fragment>
        <ListSubheader component="div" inset>
            Additional Features
        </ListSubheader>
        {/*<ListItemButton component={NavLink} to="/current-month" sx={activeStyle}>*/}
        {/*    <ListItemIcon>*/}
        {/*        <AssignmentIcon />*/}
        {/*    </ListItemIcon>*/}
        {/*    <ListItemText primary="Current month" />*/}
        {/*</ListItemButton>*/}
        {/*<ListItemButton component={NavLink} to="/last-quarter" sx={activeStyle}>*/}
        {/*    <ListItemIcon>*/}
        {/*        <AssignmentIcon />*/}
        {/*    </ListItemIcon>*/}
        {/*    <ListItemText primary="Last quarter" />*/}
        {/*</ListItemButton>*/}
        {/*<ListItemButton component={NavLink} to="/year-end-sale" sx={activeStyle}>*/}
        {/*    <ListItemIcon>*/}
        {/*        <AssignmentIcon />*/}
        {/*    </ListItemIcon>*/}
        {/*    <ListItemText primary="Year-end sale" />*/}
        {/*</ListItemButton>*/}
        {/*<ListItemButton component={NavLink} to="/contact-us" sx={activeStyle}>*/}
        {/*    <ListItemIcon>*/}
        {/*        <ContactSupportIcon />*/}
        {/*    </ListItemIcon>*/}
        {/*    <ListItemText primary="Contact Us" />*/}
        {/*</ListItemButton>*/}
    </React.Fragment>
);