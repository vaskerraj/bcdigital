import React from 'react';
import { Link } from 'react-router-dom';

const HomeScreen = () => {
    return (
        <div>
            Admin Home Screen
            <Link to="/admin/product">Go to Product Screen</Link>
        </div>
    );
}

export default HomeScreen;
