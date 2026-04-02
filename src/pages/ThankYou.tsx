import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, CreditCard, Mail, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderRef = searchParams.get("ref") || "";
  const name = searchParams.get("name") || "";
  const email = searchParams.get("email") || "";
  const address = searchParams.get("address") || "";
  const txId = searchParams.get("tx") || "";

  useEffect(() => {
    if (!orderRef) {
      navigate("/", { replace: true });
    }
  }, [orderRef, navigate]);

  if (!orderRef) return null;

  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full bg-card rounded-2xl shadow-xl p-8 md:p-10 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="mx-auto text-green-500 mb-4" size={72} />
        </motion.div>

        <h1 className="text-3xl font-bold text-primary mb-2">Grazie per il tuo acquisto!</h1>
        <p className="text-muted-foreground mb-8">
          Il tuo ordine è stato confermato. Riceverai una email di conferma a breve.
        </p>

        <div className="bg-muted/50 rounded-xl p-6 text-left space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Package size={20} className="text-primary" />
            Riepilogo Ordine
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <CreditCard size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-muted-foreground">Rif. Ordine</p>
                <p className="font-semibold text-foreground">#{orderRef}</p>
              </div>
            </div>

            {name && (
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">Intestato a</p>
                  <p className="font-semibold text-foreground">{name}</p>
                  {email && <p className="text-muted-foreground">{email}</p>}
                </div>
              </div>
            )}

            {address && (
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">Spedizione</p>
                  <p className="font-semibold text-foreground whitespace-pre-wrap">{address}</p>
                </div>
              </div>
            )}

            {txId && (
              <div className="flex items-start gap-3">
                <CreditCard size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">Transazione PayPal</p>
                  <p className="font-semibold text-foreground text-xs break-all">{txId}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2" size={18} />
          Torna alla Home
        </Button>
      </motion.div>
    </div>
  );
};

export default ThankYou;
