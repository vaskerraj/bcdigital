import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import ProductScreen from './ProductScreen';

const AdminNav = () => {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log('i access window');
        }
    })
    return (
        <Router>
            <Switch>
                <Route path="/" component={HomeScreen} />
                <Route path="/product" component={ProductScreen} />
            </Switch>
        </Router>
    );
}

export default AdminNav;
