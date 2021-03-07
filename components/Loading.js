import React from 'react';
import { TransverseLoading } from 'react-loadingg';
const Loading = ({ color, style }) => (
    <div style={style}>
        <TransverseLoading color={color} />
    </div>
);
export default Loading;