import { useState, useEffect, useRef } from 'react';

const useRefDimensions = (defaultDimension) => {
  const targetRef = useRef(); //used in the container
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  //handle screen resize and initial size
  useEffect(() => {
    let target = targetRef.current;
    if (target) {
      setDimensions({
        width: target.offsetWidth,
        height: target.offsetHeight,
      });
    }

    window.addEventListener('resize', () => {
      setDimensions({
        width: target.offsetWidth,
        height: target.offsetHeight,
      });
    });

    return () => {
      window.removeEventListener('resize', () => {
        setDimensions({
          width: target.offsetWidth,
          height: target.offsetHeight,
        });
      });
    };
  }, []);

  return { targetRef, dimensions, setDimensions };
};

export default useRefDimensions;
