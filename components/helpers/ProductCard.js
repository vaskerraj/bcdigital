import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductStarIcon from './ProductStarIcon';
const ProductCard = ({ data }) => {
    return (
        <div className="product-item">

            {data.products[0].discount &&
                <div className="discount-tag">
                    -{data.products[0].discount + '%'}
                </div>
            }
            {data.createdBy.sellerRole === 'own' &&
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
                        />
                    </div>
                    <div className="product-title" title={data.name}>
                        {data.name}
                    </div>
                    <div className="product-star-rating">
                        <ProductStarIcon star={3.5} />
                    </div>
                    <div className="product-price d-flex">
                        {data.products[0].discount &&
                            <div className="del mr-2">Rs.{data.products[0].price}</div>
                        }
                        <div className="price"> Rs.{data.products[0].finalPrice}</div>
                    </div>
                </a>
            </Link >
        </div >
    );
}

export default ProductCard;
