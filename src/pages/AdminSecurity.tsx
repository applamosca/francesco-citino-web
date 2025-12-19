import { useEffect, useState } from "react";
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
  RefreshCw,
  Ban,
  Unlock,
  Trash2,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAccessLogs, useSecurityStats } from "@/hooks/useAccessLogs";
import { useBlockedIPs, useBlockIP, useUnblockIP, useDeleteBlockedIP } from "@/hooks/useBlockedIPs";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const AdminSecurity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, isAdmin } = useAuth();
  
  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useAccessLogs(100);
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useSecurityStats();
  const { data: blockedIPs, isLoading: blockedLoading, refetch: refetchBlocked } = useBlockedIPs();
  
  const blockIPMutation = useBlockIP();
  const unblockIPMutation = useUnblockIP();
  const deleteBlockedIPMutation = useDeleteBlockedIP();

  const [newIP, setNewIP] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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
    refetchBlocked();
    toast({
      title: "Dati aggiornati",
      description: "I log di sicurezza sono stati aggiornati",
    });
  };

  const handleBlockIP = async () => {
    if (!newIP.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un indirizzo IP valido",
        variant: "destructive",
      });
      return;
    }

    await blockIPMutation.mutateAsync({ 
      ip_address: newIP.trim(), 
      reason: blockReason.trim() || undefined 
    });
    
    setNewIP("");
    setBlockReason("");
    setDialogOpen(false);
  };

  const handleBlockFromLog = async (ip: string) => {
    await blockIPMutation.mutateAsync({ 
      ip_address: ip, 
      reason: "Bloccato dalla dashboard sicurezza" 
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-orange-600">
                <Ban size={16} />
                IP bloccati attivi
              </CardDescription>
              <CardTitle className="text-2xl text-orange-600">
                {blockedIPs?.filter(ip => ip.is_active).length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs for Logs and Blocked IPs */}
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logs">Log Accessi</TabsTrigger>
            <TabsTrigger value="blocked">IP Bloccati</TabsTrigger>
          </TabsList>

          <TabsContent value="logs">
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
                          <th className="text-left py-3 px-2 font-medium">Azioni</th>
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
                            <td className="py-3 px-2">
                              {log.ip_address && !blockedIPs?.some(b => b.ip_address === log.ip_address && b.is_active) && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleBlockFromLog(log.ip_address!)}
                                  disabled={blockIPMutation.isPending}
                                >
                                  <Ban size={14} className="mr-1" />
                                  Blocca
                                </Button>
                              )}
                              {log.ip_address && blockedIPs?.some(b => b.ip_address === log.ip_address && b.is_active) && (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  Bloccato
                                </Badge>
                              )}
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
          </TabsContent>

          <TabsContent value="blocked">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Ban size={20} />
                      IP Bloccati
                    </CardTitle>
                    <CardDescription>
                      Gestisci gli indirizzi IP bloccati
                    </CardDescription>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus size={18} className="mr-2" />
                        Blocca IP
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Blocca Indirizzo IP</DialogTitle>
                        <DialogDescription>
                          Inserisci l'indirizzo IP da bloccare e opzionalmente un motivo.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Indirizzo IP</label>
                          <Input
                            placeholder="es. 192.168.1.1"
                            value={newIP}
                            onChange={(e) => setNewIP(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Motivo (opzionale)</label>
                          <Textarea
                            placeholder="es. Tentativi di accesso sospetti"
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Annulla
                        </Button>
                        <Button 
                          onClick={handleBlockIP} 
                          disabled={blockIPMutation.isPending}
                        >
                          {blockIPMutation.isPending ? "Blocco in corso..." : "Blocca IP"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {blockedLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Caricamento...
                  </div>
                ) : blockedIPs && blockedIPs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">IP</th>
                          <th className="text-left py-3 px-2 font-medium">Motivo</th>
                          <th className="text-left py-3 px-2 font-medium">Data Blocco</th>
                          <th className="text-left py-3 px-2 font-medium">Stato</th>
                          <th className="text-left py-3 px-2 font-medium">Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blockedIPs.map((blocked) => (
                          <tr key={blocked.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">
                              <span className="font-mono">{blocked.ip_address}</span>
                            </td>
                            <td className="py-3 px-2 text-muted-foreground max-w-[200px] truncate">
                              {blocked.reason || "-"}
                            </td>
                            <td className="py-3 px-2 whitespace-nowrap">
                              {format(new Date(blocked.blocked_at), "dd MMM yyyy HH:mm", { locale: it })}
                            </td>
                            <td className="py-3 px-2">
                              {blocked.is_active ? (
                                <Badge variant="destructive">Attivo</Badge>
                              ) : (
                                <Badge variant="secondary">Disattivato</Badge>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex gap-2">
                                {blocked.is_active ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => unblockIPMutation.mutate(blocked.id)}
                                    disabled={unblockIPMutation.isPending}
                                  >
                                    <Unlock size={14} className="mr-1" />
                                    Sblocca
                                  </Button>
                                ) : (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 size={14} className="mr-1" />
                                        Elimina
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Elimina record?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Questa azione eliminerà definitivamente il record del blocco IP.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteBlockedIPMutation.mutate(blocked.id)}
                                        >
                                          Elimina
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Ban className="mx-auto mb-4 opacity-50" size={48} />
                    <p>Nessun IP bloccato</p>
                    <p className="text-sm mt-2">Gli IP bloccati appariranno qui</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSecurity;
