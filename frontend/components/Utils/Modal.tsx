import { ReactNode } from "react";
import styles from "../../styles/components/Utils/Modal.module.scss"

type ModalProps = {
    onClickOutside: () => void;
    onExit: () => void;
    children: ReactNode;
}

const Modal = ({ onClickOutside, onExit, children }: ModalProps) => {
    return (
        <div className={styles.Modal}>


            <div className={styles.Modal_background} onClick={onClickOutside}></div>
            <div className={styles.Modal_container}>
                <div className={styles.Modal_close}>
                    <img src="/icons/close.svg" alt="close modal" onClick={onExit} />
                </div>

                <div>{children}</div>
            </div>
        </div>
    )
}

export default Modal