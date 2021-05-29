import React from 'react';
import StarFillIcon from './StarFillIcon';
import StarHalfIcon from './StarHalfIcon';
import StarNotFIllIcon from './StarNotFIllIcon';

const ProductStarIcon = ({ star }) => {
    switch (star) {
        case 0: {
            return (
                <>
                </>
            )
            break;
        }
        case 1:
            return (
                <>
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                </>
            )
            break;
        case 1.5:
            return (
                <>
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarHalfIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                </>
            )
            break;
        case 2:
            return (
                <>
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                </>
            )
            break;
        case 2.5:
            return (
                <>
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarHalfIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                </>
            )
            break;
        case 3:
            return (
                <>
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                </>
            )
            break;
        case 3.5:
            return (
                <>
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarHalfIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                </>
            )
            break;
        case 4:
            return (
                <>
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarNotFIllIcon classes={'star-size14'} currentColor={'#fdd835'} />
                </>
            )
            break;
        case 4.5:
            return (
                <>
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarHalfIcon classes={'star-size14'} currentColor={'#fdd835'} />
                </>
            )
            break;
        case 5:
            return (
                <>
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                    <StarFillIcon classes={'star-size14'} currentColor={'#fdd835'} />
                </>
            )
            break;
        default: return star;
    }
}

export default ProductStarIcon;
