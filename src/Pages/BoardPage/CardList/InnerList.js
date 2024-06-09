import React from 'react';
import Column from './Column';

const InnerList = ({ column, index }) => {
  if (!column) return null;

  return <Column column={column} index={index} />;
};

export default InnerList;
