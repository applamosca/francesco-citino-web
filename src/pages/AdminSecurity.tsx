import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Globe,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAccessLogs, useSecurityStats } from "@/hooks/useAccessLogs";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const AdminSecurity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, isAdmin } = useAuth();
  
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useAccessLogs(100);
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useSecurityStats();

  useEffect(() => {
    if (!session) {
      toast({
        title: "Accesso negato",
        description: "Devi effettuare il login",
        variant: "destructive",
      });
      navigate("/auth");
    } else if (!isAdmin) {
      toast({
        title: "Accesso negato",
        description: "Non hai i permessi per accedere a questa pagina",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [session, isAdmin, navigate, toast]);

  const handleRefresh = () => {
    refetchLogs();
    refetchStats();
    toast({
      title: "Dati aggiornati",
      description: "I log di sicurezza sono stati aggiornati",
    });
  };

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="text-primary" size={24} />
            </div>
            <CardTitle className="text-2xl">Verifica autenticazione...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="text-primary" size={24} />
              <h1 className="text-2xl font-bold text-primary">Dashboard Sicurezza</h1>
            </div>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2" size={18} />
            Aggiorna
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Clock size={16} />
                  Ultime 24 ore
                </CardDescription>
                <CardTitle className="text-3xl">{stats?.attempts_24h || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Tentativi totali</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-green-600">
                  <CheckCircle size={16} />
                  Login riusciti (24h)
                </CardDescription>
                <CardTitle className="text-3xl text-green-600">{stats?.successful_24h || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-600/70">Accessi autorizzati</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-red-600">
                  <XCircle size={16} />
                  Login falliti (24h)
                </CardDescription>
                <CardTitle className="text-3xl text-red-600">{stats?.failed_24h || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600/70">Tentativi non riusciti</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle size={16} />
                  Attività sospette (24h)
                </CardDescription>
                <CardTitle className="text-3xl text-yellow-600">{stats?.suspicious_24h || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-600/70">Richieste alert inviate</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Globe size={16} />
                IP unici (24h)
              </CardDescription>
              <CardTitle className="text-2xl">{stats?.unique_ips_24h || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tentativi falliti (7 giorni)</CardDescription>
              <CardTitle className="text-2xl text-red-600">{stats?.failed_7d || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Attività sospette (7 giorni)</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">{stats?.suspicious_7d || 0}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Access Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Log degli Accessi
            </CardTitle>
            <CardDescription>
              Ultimi 100 tentativi di accesso registrati
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Caricamento log...
              </div>
            ) : logs && logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Data/Ora</th>
                      <th className="text-left py-3 px-2 font-medium">Email</th>
                      <th className="text-left py-3 px-2 font-medium">IP</th>
                      <th className="text-left py-3 px-2 font-medium">Stato</th>
                      <th className="text-left py-3 px-2 font-medium">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr 
                        key={log.id} 
                        className={`border-b hover:bg-muted/50 ${
                          log.is_suspicious ? "bg-red-50 dark:bg-red-950/20" : ""
                        }`}
                      >
                        <td className="py-3 px-2 whitespace-nowrap">
                          {format(new Date(log.created_at), "dd MMM yyyy HH:mm:ss", { locale: it })}
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-mono text-xs">{log.email}</span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-mono text-xs">{log.ip_address || "N/A"}</span>
                        </td>
                        <td className="py-3 px-2">
                          {log.is_suspicious ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle size={12} />
                              Sospetto
                            </Badge>
                          ) : log.success ? (
                            <Badge variant="default" className="bg-green-600 gap-1">
                              <CheckCircle size={12} />
                              Successo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle size={12} />
                              Fallito
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground max-w-[200px] truncate">
                          {log.failure_reason || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="mx-auto mb-4 opacity-50" size={48} />
                <p>Nessun log di accesso registrato</p>
                <p className="text-sm mt-2">I log appariranno qui quando gli utenti effettuano il login</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSecurity;
