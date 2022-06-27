import styles from '../../styles/components/Utils/Button.module.scss'

type Props = {
  text: string;
};

const Button = ({ text }: Props) => {
  return (
    <button className={styles.Button}>{text}</button>
  )
}

export default Button