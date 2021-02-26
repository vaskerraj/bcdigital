import React from 'react';
import { StaticRouter as Router, Switch, Route } from 'react-router-dom';
import HomeScreen from './HomeScreen';

const AdminNav = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" component={HomeScreen} />
            </Switch>
        </Router>
    );
}

export default AdminNav;
