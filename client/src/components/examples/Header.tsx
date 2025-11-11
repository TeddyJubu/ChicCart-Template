import Header from '../Header'

export default function HeaderExample() {
  return (
    <Header
      onCartClick={() => console.log('Cart clicked')}
      onMenuClick={() => console.log('Menu clicked')}
      cartItemCount={3}
    />
  )
}
