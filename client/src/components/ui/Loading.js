import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Loading.css';

// todo add text prop
const Loading = ({ className }) => <div className={classNames('loading', className)} />;

Loading.propTypes = {
    className: PropTypes.string,
};

export default Loading;
