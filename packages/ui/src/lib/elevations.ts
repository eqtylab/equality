import { cva } from 'class-variance-authority';

export const ELEVATION = {
  SUNKEN: 'sunken',
  BASE: 'base',
  RAISED: 'raised',
  OVERLAY: 'overlay',
  FLOATING: 'floating',
};

export type Elevation = (typeof ELEVATION)[keyof typeof ELEVATION];

export const generateElevationVariants = (
  styles: { [key: string]: string },
  baseClassName: string,
  defaultElevation: Elevation
) => {
  const classNames: { [key: string]: string } = {};
  Object.values(ELEVATION).forEach((elevation) => {
    classNames[elevation] = styles[`${baseClassName}--${elevation}`];
  });

  const variants = cva(styles[baseClassName], {
    variants: {
      elevation: classNames,
    },
    defaultVariants: {
      elevation: defaultElevation,
    },
  });

  return variants;
};
