import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, MailOpen, Trash2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile caricare i messaggi",
        variant: "destructive",
      });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string, currentReadState: boolean) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ read: !currentReadState })
      .eq('id', id);

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il messaggio",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo",
        description: currentReadState ? "Messaggio segnato come non letto" : "Messaggio segnato come letto",
      });
      fetchMessages();
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo messaggio?')) return;

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare il messaggio",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo",
        description: "Messaggio eliminato",
      });
      fetchMessages();
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Messaggi di Contatto
          </h2>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} {unreadCount === 1 ? 'messaggio non letto' : 'messaggi non letti'}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMessages}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Ricarica
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Caricamento messaggi...
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nessun messaggio ricevuto
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`p-4 ${!message.read ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {message.read ? (
                          <MailOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                        <h3 className="font-semibold text-foreground">
                          {message.name}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          ({message.email})
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(message.created_at).toLocaleString('it-IT')}
                      </p>
                      <p className="text-foreground whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(message.id, message.read)}
                      >
                        {message.read ? (
                          <Mail className="h-4 w-4" />
                        ) : (
                          <MailOpen className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMessage(message.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
};
