/**
 * Pluggable Payment Abstraction Layer
 * Supports Pay on Arrival, and test simulators for CIB / Edahabia and International Cards.
 * Architecture is designed to plug directly into SATIM / CIB Web Gateway or Stripe.
 */

export interface PaymentRequest {
  reservationId: string;
  amountDzd: number;
  method: 'arrival' | 'cib' | 'edahabia' | 'card';
  customerName: string;
  customerEmail: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionRef: string;
  status: 'pending' | 'completed' | 'failed';
  isSimulator: boolean;
  message: string;
}

export interface PaymentProvider {
  processPayment(req: PaymentRequest): Promise<PaymentResult>;
}

export class PayOnArrivalProvider implements PaymentProvider {
  async processPayment(req: PaymentRequest): Promise<PaymentResult> {
    const ref = `POA-${Date.now().toString().slice(-8)}`;
    return {
      success: true,
      transactionRef: ref,
      status: 'pending',
      isSimulator: false,
      message: 'Paiement enregistré à régler lors de l\'enregistrement à la réception de l\'hôtel.',
    };
  }
}

export class CIBEdahabiaSimulatorProvider implements PaymentProvider {
  async processPayment(req: PaymentRequest): Promise<PaymentResult> {
    const ref = `SATIM-SIM-${Date.now().toString().slice(-8)}`;
    return {
      success: true,
      transactionRef: ref,
      status: 'completed',
      isSimulator: true,
      message: '[ENVIRONNEMENT DE TEST / SIMULATEUR CIB-EDAHABIA] Paiement simulé validé avec succès sans débit réel.',
    };
  }
}

export class InternationalCardSimulatorProvider implements PaymentProvider {
  async processPayment(req: PaymentRequest): Promise<PaymentResult> {
    const ref = `INT-SIM-${Date.now().toString().slice(-8)}`;
    return {
      success: true,
      transactionRef: ref,
      status: 'completed',
      isSimulator: true,
      message: '[ENVIRONNEMENT DE TEST / SIMULATEUR CARTE INTERNATIONALE] Transaction bancaire de test validée.',
    };
  }
}

export function getPaymentProvider(method: 'arrival' | 'cib' | 'edahabia' | 'card'): PaymentProvider {
  switch (method) {
    case 'cib':
    case 'edahabia':
      return new CIBEdahabiaSimulatorProvider();
    case 'card':
      return new InternationalCardSimulatorProvider();
    case 'arrival':
    default:
      return new PayOnArrivalProvider();
  }
}
