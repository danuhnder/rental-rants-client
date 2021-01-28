import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import Reviews from './Reviews';
import ReviewForm from './ReviewInput/ReviewForm';
import ReviewShow from './ReviewInput/ReviewShow';
import ReviewSubmit from './ReviewInput/ReviewSubmit';
import LoginCard from './LoginCard';
// import UserAuth from './UserAuth';
import useVisualMode from '../hooks/useVisualMode';
import useReviewBuilder from '../hooks/useReviewBuilder';
import TenancyForm from './ReviewInput/TenancyForm';
import Logout from '../components/Logout';
import NeighbourhoodReviews from './NeighbourhoodReviews';
import NeighbourhoodReviewDetail from './NeighbourhoodReviewDetail';

export default function VisualModeBox(props) {
  // Keeps container overtop of map
  const containerStyle = {
    width: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    // top: '60vh',
    zIndex: '1',
    padding: '0'
  };

  const childStyle = {
    pointerEvents: 'auto',
    zIndex: '10',
  };

  const LOG_IN_FROM_NAV = 'LOG_IN_FROM_NAV';
  const LOG_IN_FROM_CREATE = 'LOG_IN_FROM_CREATE';
  const SHOW_REVIEWS = 'SHOW_REVIEWS';
  const SHOW_FULL_REVIEW = 'SHOW_FULL_REVIEW';
  const CREATE_TENANCY = 'CREATE_TENANCY';
  const CREATE_PROPERTY_REVIEW = 'CREATE_PROPERTY_REVIEW';
  const CREATE_LANDLORD_REVIEW = 'CREATE_LANDLORD_REVIEW';
  const CREATE_NEIGHBOURHOOD_REVIEW = 'CREATE_NEIGHBOURHOOD_REVIEW';
  const SUBMIT_REVIEW = 'SUBMIT_REVIEW';
  const SEE_NEIGHBOURHOOD_REVIEWS = 'SEE_NEIGHBOURHOOD_REVIEWS';
  const SHOW_NEIGHBOURHOOD_REVIEW_DETAIL = 'SHOW_NEIGHBOURHOOD_REVIEW_DETAIL';

  // declare helper functions from hooks
  const { mode, transition, back } = useVisualMode(SHOW_REVIEWS);

  const [tenancyID, setTenancyID] = useState();

  const {
    state,
    setTenancyStartDate,
    setTenancyEndDate,
    setPropertyRating,
    setPropertyReview,
    setLandlordRating,
    setLandlordReview,
    setNeighbourhoodRating,
    setNeighbourhoodReview,
  } = useReviewBuilder();

  const resetForm = () => {
    setTenancyStartDate('');
    setTenancyEndDate('');
    setPropertyRating(null);
    setPropertyReview('');
    setLandlordRating(null);
    setLandlordReview('');
    setNeighbourhoodRating(null);
    setNeighbourhoodReview('');
  };

  const loggingIn = () => {
    if (mode === LOG_IN_FROM_NAV) {
      return true;
    }
    if (mode === LOG_IN_FROM_CREATE) {
      return true;
    }
    return false;
  };

  return (
    <Container style={containerStyle}>
      <Logout
        style={childStyle}
        onLogout={() => {
          transition(SHOW_REVIEWS);
          resetForm();
        }}
        onLogin={() => (!loggingIn() ? transition(LOG_IN_FROM_NAV) : null)}
      />
      {mode === SHOW_REVIEWS && props.selectedPlace && (
        <Reviews
          data={props.reviewData}
          seeMore={() => transition(SEE_NEIGHBOURHOOD_REVIEWS)}
          addNew={() =>
            transition(
              localStorage.getItem('user') ? CREATE_TENANCY : LOG_IN_FROM_CREATE
            )
          }
          onClick={tenancyID => {
            setTenancyID(tenancyID);
            transition(SHOW_FULL_REVIEW);
          }}
        />
      )}
      {mode === SHOW_FULL_REVIEW && (
        <ReviewShow
          onClose={() => back()}
          data={props.reviewData}
          tenancyID={tenancyID}
        />
      )}
      {mode === SEE_NEIGHBOURHOOD_REVIEWS && (
        <NeighbourhoodReviews
          onBack={() => back()}
          data={props.neighbourhoodReviewData}
          onClick={tenancyID => {
            setTenancyID(tenancyID);
            transition(SHOW_NEIGHBOURHOOD_REVIEW_DETAIL);
          }}
        />
      )}
      {mode === SHOW_NEIGHBOURHOOD_REVIEW_DETAIL && (
        <NeighbourhoodReviewDetail
          onClose={() => back()}
          data={props.neighbourhoodReviewData}
          tenancyID={tenancyID}
        />
      )}
      {mode === LOG_IN_FROM_CREATE && (
        <LoginCard
          title={'Please login to write a review'}
          onSuccess={() => {
            back();
            transition(CREATE_TENANCY);
          }}
          onBack={() => back()}
        />
      )}
      {mode === LOG_IN_FROM_NAV && (
        <LoginCard
          title={'Login or Register'}
          onSuccess={() => back()}
          onBack={() => back()}
        />
      )}
      {mode === CREATE_TENANCY && (
        <TenancyForm
          startDate={state.tenancyStartDate || ''}
          endDate={state.tenancyEndDate || ''}
          onStartChange={value => setTenancyStartDate(value)}
          onEndChange={value => setTenancyEndDate(value)}
          onNext={() => transition(CREATE_PROPERTY_REVIEW)}
          onBack={() => {
            back();
            resetForm();
          }}
        />
      )}
      {mode === CREATE_PROPERTY_REVIEW && (
        <ReviewForm
          title={'property'}
          previewWarning={
            'The preview card will only display the first 80 characters... So make them catchy!'
          }
          rating={state.propertyRating || null}
          onRatingChange={value => setPropertyRating(value)}
          review={state.propertyReview || ''}
          onChange={value => setPropertyReview(value)}
          onNext={() => transition(CREATE_LANDLORD_REVIEW)}
          onBack={() => back()}
        />
      )}
      {mode === CREATE_LANDLORD_REVIEW && (
        <ReviewForm
          title={'landlord'}
          previewWarning={' '}
          rating={state.landlordRating || null}
          onRatingChange={value => setLandlordRating(value)}
          review={state.landlordReview || ''}
          onChange={value => setLandlordReview(value)}
          onNext={() => transition(CREATE_NEIGHBOURHOOD_REVIEW)}
          onBack={() => back()}
        />
      )}
      {mode === CREATE_NEIGHBOURHOOD_REVIEW && (
        <ReviewForm
          title={'neighbourhood'}
          previewWarning={' '}
          rating={state.neighbourhoodRating}
          onRatingChange={value => setNeighbourhoodRating(value)}
          review={state.neighbourhoodReview || ''}
          onChange={value => setNeighbourhoodReview(value)}
          seeMore={() => transition(SEE_NEIGHBOURHOOD_REVIEWS)}
          onNext={() => transition(SUBMIT_REVIEW)}
          onBack={() => back()}
        />
      )}
      {mode === SUBMIT_REVIEW && (
        <ReviewSubmit
          tenancyStartDate={state.tenancyStartDate}
          tenancyEndDate={state.tenancyEndDate}
          propertyRating={state.propertyRating}
          propertyReview={state.propertyReview}
          landlordRating={state.landlordRating}
          landlordReview={state.landlordReview}
          neighbourhoodRating={state.neighbourhoodRating}
          neighbourhoodReview={state.neighbourhoodReview}
          onSubmit={() => {
            props.onSubmit(state);
            transition(SHOW_REVIEWS);
            resetForm();
          }}
          onBack={() => back()}
          buttonName={'Submit'}
        />
      )}
    </Container>
  );
}
