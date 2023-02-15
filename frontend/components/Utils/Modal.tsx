import { ReactNode, useEffect } from "react";
import styles from "../../styles/components/Utils/Modal.module.scss"
import XmarkSvg from "./svg/XmarkSvg";

type ModalProps = {
    onClickOutside: () => void;
    onExit: () => void;
    children: ReactNode;
}

const Modal = ({ onClickOutside, onExit, children }: ModalProps) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'unset';
        }
    }, [])

    return (
        <div className={styles.Modal}>


            <div className={styles.Modal_background} onClick={onClickOutside}></div>
            <div className={styles.Modal_container}>
                <div className={styles.Modal_close} onClick={onExit}>
                    <XmarkSvg />
                </div>

                <div>{children}</div>
            </div>
        </div>
    )
}

export default Modal