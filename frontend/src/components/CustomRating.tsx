import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';

interface CustomRatingProps {
	ratingID: string;
	type?: string;
	ratingCount?: number;
	handleGetRatingValue?: Function;
	initialRating?: number;
	size?: 'small' | 'medium' | 'large';
	color?: string;
	readOnly?: boolean;
	showText?: boolean;
}

const CustomRating: React.FC<CustomRatingProps> = (props) => {
	const {
		ratingID, 
		type = "Stars",
		ratingCount = 5,
		handleGetRatingValue,
		initialRating = 0,
		size = 'medium',
		color = '#ffc107',
		readOnly = false,
		showText = false
	} = props;

	const [rating, setRating] = useState<number>(initialRating);
	const [hoverRating, setHoverRating] = useState<number>(0);

	// Size mapping
	const sizeMap = {
		small: '20px',
		medium: '24px',
		large: '32px'
	};

	const updateIntoFormState = (value: number) => {
		if (handleGetRatingValue && typeof handleGetRatingValue === "function") {
			handleGetRatingValue({
				target: {
					id: ratingID,
					value: value
				}
			});
		}
	}

	// Update rating when initialRating changes (data loaded)
	// Also update parent state with the initial value
	useEffect(() => {
		setRating(initialRating);
		updateIntoFormState(initialRating);  // ← Added back
	}, [initialRating]);  // ← Removed updateIntoFormState from deps to prevent infinite loop

	const handleClick = (value: number) => {
		if (readOnly) return;
		setRating(value);
		updateIntoFormState(value);
	};

	const handleMouseEnter = (value: number) => {
		if (readOnly) return;
		setHoverRating(value);
	};

	const handleMouseLeave = () => {
		if (readOnly) return;
		setHoverRating(0);
	};

	const getStarIcon = (index: number) => {
		const starValue = index + 1;
		
		if (hoverRating > 0) {
			return starValue <= hoverRating ? solidStar : regularStar;
		}
		
		return starValue <= rating ? solidStar : regularStar;
	};

	return (
		<div className="custom-rating-container">
			<div 
				className="rating-stars"
				onMouseLeave={handleMouseLeave}
				style={{ display: 'flex', gap: '5px' }}
			>
				{[...Array(ratingCount)].map((_, index) => (
					<FontAwesomeIcon
						key={`${ratingID}-star-${index}`}
						icon={getStarIcon(index)}
						onClick={() => handleClick(index + 1)}
						onMouseEnter={() => handleMouseEnter(index + 1)}
						style={{ 
							cursor: readOnly ? 'default' : 'pointer',
							color: color,
							fontSize: sizeMap[size],
							transition: 'transform 0.1s ease',
							opacity: readOnly ? 0.8 : 1
						}}
						className="rating-star"
					/>
				))}
			</div>
			
			{showText && (
				<div className="rating-text" style={{ 
					marginTop: '5px', 
					fontSize: size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px',
					color: '#666'
				}}>
					{hoverRating > 0 ? `${hoverRating} / ${ratingCount}` : `${rating} / ${ratingCount}`}
				</div>
			)}
		</div>
	);
};

export default CustomRating;