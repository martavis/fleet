import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import classnames from "classnames";
// @ts-ignore
import { hideFlash } from "redux/nodes/notifications/actions";

const baseClass = "modal";

export interface IModalProps {
  children: JSX.Element;
  onExit: () => void;
  title: string | JSX.Element;
  className?: string;
}

const Modal = ({
  children,
  onExit,
  title,
  className,
}: IModalProps): JSX.Element => {
  const dispatch = useDispatch();
  useEffect(() => {
    const closeWithEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onExit();
      }
    };

    dispatch(hideFlash);

    document.addEventListener("keydown", closeWithEscapeKey);

    return () => {
      document.removeEventListener("keydown", closeWithEscapeKey);
    };
  }, []);

  const modalContainerClassName = classnames(
    `${baseClass}__modal_container`,
    className
  );

  return (
    <div className={`${baseClass}__background`}>
      <div className={modalContainerClassName}>
        <div className={`${baseClass}__header`}>
          <span>{title}</span>
          <div className={`${baseClass}__ex`}>
            <button className="button button--unstyled" onClick={onExit} />
          </div>
        </div>
        <div className={`${baseClass}__content`}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
