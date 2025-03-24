
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DrinkExpense = {
  id: string;
  description: string;
  price: number;
  created_at: string;
};

const DrinkExpenses = () => {
  const [expenses, setExpenses] = useState<DrinkExpense[]>([]);
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
    fetchExpenses();
  }, []);

  useEffect(() => {
    // Calculate total whenever expenses change
    const sum = expenses.reduce((acc, expense) => acc + Number(expense.price), 0);
    setTotal(sum);
  }, [expenses]);

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setUserId(data.session.user.id);
    } else {
      toast.error('Debes iniciar sesión para usar esta funcionalidad');
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('drink_expenses')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setExpenses(data as DrinkExpense[]);
      }
    } catch (error: any) {
      toast.error('Error al cargar los gastos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!userId) {
      toast.error('Debes iniciar sesión para agregar gastos');
      return;
    }

    if (!newDescription.trim()) {
      toast.error('La descripción no puede estar vacía');
      return;
    }

    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('El precio debe ser un número positivo');
      return;
    }

    try {
      const { error } = await supabase
        .from('drink_expenses')
        .insert([
          {
            user_id: userId,
            description: newDescription,
            price: price,
          },
        ]);

      if (error) throw error;

      toast.success('Gasto agregado correctamente');
      setNewDescription('');
      setNewPrice('');
      fetchExpenses();
    } catch (error: any) {
      toast.error('Error al agregar el gasto: ' + error.message);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('drink_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Gasto eliminado correctamente');
      fetchExpenses();
    } catch (error: any) {
      toast.error('Error al eliminar el gasto: ' + error.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="w-full h-full flex flex-col p-2 overflow-hidden">
      <div className="grid grid-cols-12 gap-2 mb-3">
        <div className="col-span-12 md:col-span-6">
          <Input
            placeholder="Descripción (ej. Cerveza, Shots, etc.)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="win95-inset w-full border-chelas-gray-dark text-black text-sm"
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <Input
            placeholder="Precio"
            type="number"
            min="0"
            step="0.01"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="win95-inset w-full border-chelas-gray-dark text-black text-sm"
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <Button
            onClick={handleAddExpense}
            className="win95-button w-full text-black"
            disabled={!userId}
          >
            Agregar
          </Button>
        </div>
      </div>

      <div className="flex-grow overflow-hidden bg-white border-2 border-chelas-gray-dark">
        <ScrollArea className="h-full w-full pb-safe max-h-[350px]">
          <Table className="excel-table">
            <TableHeader className="sticky top-0 bg-chelas-gray-medium">
              <TableRow className="border-b border-chelas-gray-dark hover:bg-chelas-gray-light">
                <TableHead className="w-[100px] text-black text-sm font-bold border-r border-chelas-gray-dark">Hora</TableHead>
                <TableHead className="text-black text-sm font-bold border-r border-chelas-gray-dark">Descripción</TableHead>
                <TableHead className="text-right text-black text-sm font-bold border-r border-chelas-gray-dark w-[120px]">Precio</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-black">Cargando...</TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-black">No hay gastos registrados. ¡Agrega tu primera bebida!</TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id} className="border-b border-chelas-gray-dark hover:bg-chelas-gray-light">
                    <TableCell className="border-r border-chelas-gray-dark text-black text-sm">{formatDate(expense.created_at)}</TableCell>
                    <TableCell className="border-r border-chelas-gray-dark text-black text-sm">{expense.description}</TableCell>
                    <TableCell className="text-right border-r border-chelas-gray-dark text-black text-sm">{formatCurrency(expense.price)}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleDeleteExpense(expense.id)}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6"
                      >
                        <Trash2 size={14} className="text-black" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <div className="mt-3 p-2 win95-window bg-chelas-gray-medium">
        <div className="flex justify-between items-center">
          <span className="font-bold text-black">Total gastado:</span>
          <span className="font-bold text-xl text-black">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default DrinkExpenses;
