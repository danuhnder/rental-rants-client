import { useEffect, useReducer } from 'react';
import axios from 'axios';

export default function useApplicationData(initial) {
  // defines actions for reducer function
  const SET_PLACE = 'SET_PLACE';
  const SET_PLACE_REVIEW_DATA = 'SET_PLACE_REVIEW_DATA';
  const SET_NEIGHBOURHOOD_REVIEW_DATA = 'SET_NEIGHBOURHOOD_REVIEW_DATA';
  const SET_NEW_REVIEW = 'SET_NEW_REVIEW';

  function reducer(state, action) {
    switch (action.type) {
     
      case SET_PLACE:
        return {
          ...state,
          place: action.place,
        };
      case SET_PLACE_REVIEW_DATA:
        return {
          ...state,
          placeReviewData: action.placeReviewData,
        };
      case SET_NEIGHBOURHOOD_REVIEW_DATA:
        return {
          ...state,
          neighbourhoodReviewData: action.neighbourhoodReviewData,
        };
      case SET_NEW_REVIEW:
        return {
          ...state,
          newReview: action.newReview,
        };

      default:
        throw new Error(
          `Tried to reduce with unsupported action type: ${action.type}`
        );
    }
  }

  // sets initial state for the application
  const [state, dispatch] = useReducer(reducer, {
    place: null,
    placeReviewData: [],
    neighbourhoodReviewData: [],
    newReview: null,
  });

  //helper functions to modify state
  const setPlace = place => dispatch({ type: 'SET_PLACE', place });
  const setPlaceReviewData = placeReviewData =>
    dispatch({ type: 'SET_PLACE_REVIEW_DATA', placeReviewData });
  const setNeighbourhoodReviewData = neighbourhoodReviewData =>
    dispatch({
      type: 'SET_NEIGHBOURHOOD_REVIEW_DATA',
      neighbourhoodReviewData,
    });
  const setNewReview = newReview =>
    dispatch({ type: 'SET_NEW_REVIEW', newReview });

  // Passes coords from Maps API to backend
  const getReviewsFromCoords = () => {
    const lat = parseFloat(state.place.latLng.lat).toFixed(5);
    const lng = parseFloat(state.place.latLng.lng).toFixed(5);
    Promise.all([axios.get(`http://localhost:3001/api/${lat}/${lng}`)]).then(
      res => {
        // console.log(res[0].data);
        setPlaceReviewData(res[0].data[0]);
        setNeighbourhoodReviewData(res[0].data[1]);
      }
    );
  };

  const postNewReview = async () => {
    const user = JSON.parse(localStorage.getItem('user')).userID;
    const reviewData = {
      //localStorage.getItem(‘user’).id
      user: user,
      place: state.place,
      review: state.newReview,
    };
    // console.log('review data, ', reviewData);
    // console.log(reviewData);
    await axios
      .post(`http://localhost:3001/api/review`, { reviewData })
      .then(res => {
        console.log('Saved to the DB');
      })
      .then(() => getReviewsFromCoords());
  };

  useEffect(() => {
    if (state.place) {
      getReviewsFromCoords();
    }
  }, [state.place, state.newReview]);

  useEffect(() => {
    if (state.newReview) {
      postNewReview();
    }
  }, [state.newReview]);

  return { state, setPlace, setNewReview };
}
