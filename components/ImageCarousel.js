import React from 'react';
import { Carousel } from 'antd';
import Link from 'next/link';
import Image from 'next/image';

const ImageCarousel = ({ data, autoplay, autoplaySpeed, imgWidth, imgHeight, imgQuality }) => {
    return (
        <Carousel autoplay={autoplay} autoplaySpeed={autoplaySpeed}>
            {
                data.map((item, index) => (
                    <div key={item._id}>
                        {
                            item.bannerFor !== 'show_case' ?
                                <Link
                                    href={
                                        item.bannerFor === "product_promtion" ?
                                            `/product/${item.productId.slug}`
                                            :
                                            `/shop/${item.sellerId.name}/${item.sellerId._id}`
                                    }
                                >
                                    <a key={item._id} className="cp">
                                        <Image src={`/uploads/banners/${item.webImage}`} layout="responsive"
                                            width={imgWidth}
                                            height={imgHeight}
                                            quality={imgQuality}
                                            priority={index === 0 ? true : false}
                                        />
                                    </a>
                                </Link>
                                :
                                <div key={item._id} className="position-relative">
                                    <Image src={`/uploads/banners/${item.webImage}`} layout="responsive"
                                        width={imgWidth}
                                        height={imgHeight}
                                        quality={imgQuality}
                                        priority={index === 0 ? true : false}
                                    />
                                </div>
                        }
                    </div>
                ))
            }
        </Carousel>
    );
}

export default ImageCarousel;
