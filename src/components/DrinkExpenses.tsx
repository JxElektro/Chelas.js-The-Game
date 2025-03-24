
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type DrinkExpense = {
  id: string;
  description: string;
  price: number;
  created_at: string;
};

export default function DrinkExpenses() {
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
    const sum = expenses.reduce((acc, expense) => acc + Number(expense.price), 0);
    setTotal(sum);
  }, [expenses]);

  // Calculamos propina del 10%
  const tip = total * 0.1;
  const finalWithTip = total + tip;

  async function checkUser() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setUserId(data.session.user.id);
    } else {
      toast.error('Debes iniciar sesión para usar esta funcionalidad');
    }
  }

  async function fetchExpenses() {
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
  }

  async function handleAddExpense() {
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
  }

  async function handleDeleteExpense(id: string) {
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
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  return (
    // Contenedor principal (flex vertical)
    <div className="flex flex-col h-full min-h-0 p-2">

      {/* Formulario de ingreso */}
      <div className="grid grid-cols-12 gap-2 mb-3 flex-shrink-0">
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

      {/* Contenedor para la tabla con scroll interno */}
      <div className="flex-grow min-h-0 border-2 border-chelas-gray-dark flex flex-col">
        {/* Cabecera de la tabla */}
        <div className="bg-chelas-gray-medium flex-shrink-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-chelas-gray-dark hover:bg-chelas-gray-light">
                <TableHead className="w-[100px] text-black text-sm font-bold border-r border-chelas-gray-dark">
                  Hora
                </TableHead>
                <TableHead className="text-black text-sm font-bold border-r border-chelas-gray-dark">
                  Descripción
                </TableHead>
                <TableHead className="text-right text-black text-sm font-bold border-r border-chelas-gray-dark w-[120px]">
                  Precio
                </TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
          </Table>
        </div>
<<<<<<< HEAD

        {/* Cuerpo de la tabla scrolleable */}
        <div className="flex-grow min-h-0 overflow-auto bg-white">
          <ScrollArea className="w-full h-full">
=======
        
        <div className="flex-grow bg-white">
          <ScrollArea className="h-[calc(100vh-280px)] w-full rounded-none border-t border-chelas-gray-dark" style={{ overflow: 'visible' }}>
>>>>>>> 42203afad7eb3d0b4edba96f80abf783ca497dcf
            <Table>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-black">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-black">
                      No hay gastos registrados. ¡Agrega tu primera bebida!
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow
                      key={expense.id}
                      className="border-b border-chelas-gray-dark hover:bg-chelas-gray-light"
                    >
                      <TableCell className="border-r border-chelas-gray-dark text-black text-sm">
                        {formatDate(expense.created_at)}
                      </TableCell>
                      <TableCell className="border-r border-chelas-gray-dark text-black text-sm">
                        {expense.description}
                      </TableCell>
                      <TableCell className="text-right border-r border-chelas-gray-dark text-black text-sm">
                        {formatCurrency(expense.price)}
                      </TableCell>
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
      </div>

      {/* Sección de totales (al estilo Excel) al final */}
      <div className="mt-3 flex flex-col flex-shrink-0 p-2 win95-window bg-chelas-gray-medium text-black">
        {/* Total sin propina */}
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold">Total sin propina:</span>
          <span className="font-bold text-xl">{formatCurrency(total)}</span>
        </div>

        {/* Propina 10% */}
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold">Propina (10%):</span>
          <span className="font-bold text-xl">{formatCurrency(tip)}</span>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-black my-1" />

        {/* Total final (con propina) */}
        <div className="flex justify-between items-center">
          <span className="font-bold">Total + propina:</span>
          <span className="font-bold text-xl">{formatCurrency(finalWithTip)}</span>
        </div>
      </div>
    </div>
  );
}
