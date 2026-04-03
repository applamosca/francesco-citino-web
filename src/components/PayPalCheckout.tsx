import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { BookPurchaseForm } from "@/components/BookPurchaseForm";

const PAYPAL_CLIENT_ID = "Aa0HCSnL2JZ3UOVjoOdsTJAw9SXFLZt2luZBOgc5Hyux6Oj0r_ua3zoGwOBRt4cYz4CKMB7wXeFQ7kgw";

interface PayPalCheckoutProps {
  bookId: string;
  price: number;
  onSuccess: () => void;
}

const PayPalCheckout = ({ bookId, price, onSuccess }: PayPalCheckoutProps) => (
  <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "EUR" }}>
    <BookPurchaseForm onSuccess={onSuccess} bookId={bookId} price={price} />
  </PayPalScriptProvider>
);

export default PayPalCheckout;
