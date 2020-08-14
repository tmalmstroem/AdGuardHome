import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Loading.css';

const Loading = ({ className, text }) => (
        // todo translate
        <div className={classNames('loading', className)}>{text}</div>
);

Loading.propTypes = {
    className: PropTypes.string,
    text: PropTypes.string,
};

export default Loading;
