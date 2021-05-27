import React from 'react';
import { Carousel } from 'antd';
import Link from 'next/link';
import Image from 'next/image';

const ImageCarousel = ({ data, autoplay, autoplaySpeed, imgWidth, imgHeight, imgQuality }) => {
    return (
        <Carousel autoplay={autoplay} autoplaySpeed={autoplaySpeed}>
            {
                data.map(item => (
                    <>
                        {
                            item.bannerFor !== 'show_case' ?
                                <Link key={item._id} className="cp"
                                    href={
                                        item.bannerFor === "product_promtion" ?
                                            `/product/${item.productId.slug}`
                                            :
                                            `/shop/${item.sellerId.name}/${item.sellerId._id}`
                                    }
                                >
                                    <Image src={`/uploads/banners/${item.webImage}`} layout="responsive"
                                        width={imgWidth}
                                        height={imgHeight}
                                        quality={imgQuality} />
                                </Link>
                                :
                                <div key={item._id} className="position-relative">
                                    <Image src={`/uploads/banners/${item.webImage}`} layout="responsive"
                                        width={imgWidth}
                                        height={imgHeight}
                                        quality={imgQuality} />
                                </div>
                        }
                    </>
                ))
            }
        </Carousel>
    );
}

export default ImageCarousel;
