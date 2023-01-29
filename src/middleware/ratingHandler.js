module.exports.generateRating = async (ratingTo, ratingBy, rating, review) => {
  let userRatings = {
    ratingTo,
    ratingBy,
    rating,
    review,
  };
  return userRatings;
};
