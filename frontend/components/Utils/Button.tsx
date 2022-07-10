import styles from '../../styles/components/Utils/Button.module.scss'

type Props = {
  text: string;
  onClick?: Function
};

const Button = (props: Props) => {
  const { text, onClick } = props
  return (
    <button className={styles.Button} onClick={() => onClick!()}>{text}</button>
  )
}

export default Button