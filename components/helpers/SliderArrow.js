import { ChevronLeft, ChevronRight } from 'react-feather';
export const SliderNextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            onClick={onClick}
        >
            <ChevronRight />
        </div>
    );
}

export const SliderPrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            onClick={onClick}
        >
            <ChevronLeft />
        </div>
    );
}