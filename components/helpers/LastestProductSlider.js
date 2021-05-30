import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import { SliderNextArrow, SliderPrevArrow } from './SliderArrow';
import ProductCard from '../ProductCard';

const LastestProductSlider = ({ data }) => {
    const lastestSliderSettings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 5,
        initialSlide: 0,
        variableWidth: true,
        nextArrow: <SliderNextArrow />,
        prevArrow: <SliderPrevArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: false
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    initialSlide: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };
    return (
        <Slider {...lastestSliderSettings}>
            {data.map(product => (
                <div key={data._id}>
                    <ProductCard data={product} />
                </div>
            ))}
        </Slider>
    );
}

export default LastestProductSlider;
