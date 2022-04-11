import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductStarIcon from './ProductStarIcon';
import { checkProductDiscountValidity } from '../../helpers/productDiscount';
import { customImageLoader } from '../../helpers/functions';

const ProductCard = ({ data }) => {
    const isPromoValidate = checkProductDiscountValidity(data.products[0].promoStartDate, data.products[0].promoEndDate);

    return (
        <div className="product-item">

            {data.products[0].discount !== 0 && data.products[0].discount !== null && isPromoValidate &&
                <div className="discount-tag">
                    -{data.products[0].discount + '%'}
                </div>
            }
            {data.createdBy?.sellerRole === 'own' &&
                <div className="feature-shop">
                    <Link href={`/seller/${data.createdBy._id}`}>
                        <a className="badge bg-info">{data.createdBy.name}</a>
                    </Link>
                </div>
            }
            <Link href={`/product/${data._id}/${data.slug}`}>
                <a>
                    <div className="product-image">
                        <Image src={`/uploads/products/${data.colour[0].images[0]}`}
                            layout="fill"
                            objectFit="cover"
                            objectPosition="top center"
                            quality="40"
                            loader={customImageLoader}
                        />
                    </div>
                    <div className="product-title" title={data.name}>
                        {data.name}
                    </div>
                    <div className="product-star-rating">
                        <ProductStarIcon star={Math.round(data.rating) || 0} />
                    </div>
                    <div className="product-price d-flex">
                        {data.products[0].discount !== 0 && data.products[0].discount !== null && isPromoValidate &&
                            <div className="del mr-2">Rs.{data.products[0].price}</div>
                        }
                        <div className="price">
                            Rs.{isPromoValidate === true ?
                                data.products[0].finalPrice
                                : data.products[0].price}
                        </div>
                    </div>
                </a>
            </Link >
        </div >
    );
}

export default ProductCard;
