import styles from "../../styles/components/Utils/Spinner.module.scss"

type Props = {
    size: number;
};

const Spinner = ({ size }: Props) => {
    return (
        <div style={{ width: `${size}px`, height: `${size}px` }} className={styles.Spinner}></div>
    )
}

export default Spinner