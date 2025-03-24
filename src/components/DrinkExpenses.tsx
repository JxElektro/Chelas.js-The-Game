
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
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
    <div className="w-full h-full flex flex-col p-4">
      <h2 className="text-xl font-bold mb-4">Control de Gastos de Bebidas</h2>
      
      <div className="grid grid-cols-12 gap-2 mb-4">
        <div className="col-span-12 md:col-span-6">
          <Input
            placeholder="Descripción (ej. Cerveza, Shots, etc.)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="win95-inset w-full"
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
            className="win95-inset w-full"
          />
        </div>
        <div className="col-span-12 md:col-span-3">
          <Button
            onClick={handleAddExpense}
            className="win95-button w-full"
            disabled={!userId}
          >
            Agregar
          </Button>
        </div>
      </div>

      <div className="flex-grow win95-inset overflow-auto">
        <Table>
          <TableCaption>Lista de bebidas y gastos de la noche</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Hora</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Cargando...</TableCell>
              </TableRow>
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No hay gastos registrados. ¡Agrega tu primera bebida!</TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.created_at)}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.price)}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDeleteExpense(expense.id)}
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 p-2 win95-window">
        <div className="flex justify-between items-center">
          <span className="font-bold">Total gastado:</span>
          <span className="font-bold text-xl">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default DrinkExpenses;
