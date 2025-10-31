import { Fragment } from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToStream,
} from "@react-pdf/renderer";
import { toEuroString } from "./money";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 36,
    fontSize: 11,
    lineHeight: 1.4,
    color: "#1c1c1c",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerBox: {
    maxWidth: "55%",
  },
  titleBox: {
    alignItems: "flex-end",
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  bold: {
    fontWeight: "bold",
  },
  section: {
    marginBottom: 18,
  },
  grid: {
    flexDirection: "row",
    gap: 18,
  },
  column: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d9d9d9",
  },
  tableCell: {
    flex: 1,
  },
  tableCellQty: {
    width: 40,
    textAlign: "right",
  },
  tableCellPrice: {
    width: 80,
    textAlign: "right",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  footer: {
    marginTop: 32,
    borderTopWidth: 0.5,
    borderTopColor: "#d9d9d9",
    paddingTop: 12,
    fontSize: 9,
    color: "#555",
  },
  payLink: {
    marginTop: 8,
    fontSize: 12,
    color: "#0070f3",
  },
});

export type PdfAddress = {
  company?: string;
  vatNumber?: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
};

export type PdfItem = {
  sku: string;
  name: string;
  qty: number;
  unitCents: number;
  vatRatePct: number;
  totalCents: number;
};

export type QuotePdfInput = {
  number: string;
  issueDate: Date;
  customer: {
    email: string;
    phone?: string;
    shipping: PdfAddress;
    billing: PdfAddress;
  };
  company: {
    name: string;
    siret: string;
    vatNumber: string;
    addressLines: string[];
    email: string;
    phone?: string;
    website?: string;
  };
  items: PdfItem[];
  totals: {
    currency: string;
    subtotalCents: number;
    taxCents: number;
    shippingCents: number;
    totalCents: number;
  };
  payLink?: string | null;
};

export const renderQuotePdf = async (input: QuotePdfInput) => {
  const stream = await renderToStream(<QuoteDocument {...input} />);
  const buffers: Buffer[] = [];
  for await (const chunk of stream) {
    buffers.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(buffers);
};

const QuoteDocument = (input: QuotePdfInput) => {
  const { totals, items } = input;
  const issuedOn = new Date(input.issueDate).toLocaleDateString("fr-FR");
  const vatBreakdown = computeVatBreakdown(items);

  return (
    <Document title={`Devis ${input.number}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerBox}>
            <Text style={styles.bold}>{input.company.name}</Text>
            <Text>SIRET: {input.company.siret}</Text>
            <Text>TVA: {input.company.vatNumber}</Text>
            {input.company.addressLines.map((line) => (
              <Text key={line}>{line}</Text>
            ))}
            <Text>Email: {input.company.email}</Text>
            {input.company.phone ? <Text>Tél: {input.company.phone}</Text> : null}
            {input.company.website ? <Text>Site: {input.company.website}</Text> : null}
          </View>
          <View style={styles.titleBox}>
            <Text style={styles.label}>Devis</Text>
            <Text style={styles.bold}>{input.number}</Text>
            <Text>{`Émis le ${issuedOn}`}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.grid]}>
          <View style={styles.column}>
            <Text style={styles.bold}>Adresse de livraison</Text>
            <AddressBlock address={input.customer.shipping} />
          </View>
          <View style={styles.column}>
            <Text style={styles.bold}>Adresse de facturation</Text>
            <AddressBlock address={input.customer.billing} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.bold]}>Article</Text>
            <Text style={[styles.tableCellQty, styles.bold]}>Qté</Text>
            <Text style={[styles.tableCellPrice, styles.bold]}>PU TTC</Text>
            <Text style={[styles.tableCellPrice, styles.bold]}>Total TTC</Text>
          </View>
          {items.map((item) => (
            <View key={`${item.sku}:${item.name}`} style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {item.name}
                {"\n"}
                <Text>SKU: {item.sku}</Text>
                {"\n"}
                <Text>TVA: {item.vatRatePct}%</Text>
              </Text>
              <Text style={styles.tableCellQty}>{item.qty}</Text>
              <Text style={styles.tableCellPrice}>
                {toEuroString(item.unitCents)}
              </Text>
              <Text style={styles.tableCellPrice}>
                {toEuroString(item.totalCents)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.totalsRow}>
            <View>
              <Text>Sous-total HT</Text>
              <Text>TVA</Text>
              <Text>Livraison</Text>
              <Text style={styles.bold}>Total TTC</Text>
            </View>
            <View>
              <Text>{toEuroString(totals.subtotalCents)}</Text>
              <Text>{toEuroString(totals.taxCents)}</Text>
              <Text>{toEuroString(totals.shippingCents)}</Text>
              <Text style={styles.bold}>{toEuroString(totals.totalCents)}</Text>
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            <Text style={styles.bold}>Ventilation TVA</Text>
            {vatBreakdown.map((v) => (
              <Text key={v.rate}>
                {v.rate}%: {toEuroString(v.tax)} TVA sur {toEuroString(v.net)} HT
              </Text>
            ))}
          </View>
          {input.payLink ? (
            <Text style={styles.payLink}>Payer en ligne: {input.payLink}</Text>
          ) : null}
          <Text style={{ marginTop: 12 }}>
            Devis valable 15 jours. Merci de nous contacter pour toute question ou ajustement.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>
            RGPD: vos données sont traitées pour la gestion de votre commande et conservées
            pour une durée de 3 ans. Vous pouvez exercer vos droits en nous contactant à {input.company.email}.
          </Text>
          <Text>
            Conditions générales, politique de confidentialité et mentions légales disponibles
            sur {input.company.website ?? "notre site"}.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const AddressBlock = ({ address }: { address: PdfAddress }) => (
  <Fragment>
    <Text>
      {address.firstName} {address.lastName}
    </Text>
    {address.company ? <Text>{address.company}</Text> : null}
    {address.vatNumber ? <Text>TVA: {address.vatNumber}</Text> : null}
    <Text>{address.line1}</Text>
    {address.line2 ? <Text>{address.line2}</Text> : null}
    <Text>
      {address.postalCode} {address.city}
    </Text>
    <Text>{address.country}</Text>
  </Fragment>
);

const computeVatBreakdown = (items: PdfItem[]) => {
  const map = new Map<number, { net: number; tax: number }>();
  for (const item of items) {
    const entry = map.get(item.vatRatePct) ?? { net: 0, tax: 0 };
    const gross = item.totalCents;
    const rate = item.vatRatePct / 100;
    const net = Math.round(gross / (1 + rate));
    const tax = gross - net;
    entry.net += net;
    entry.tax += tax;
    map.set(item.vatRatePct, entry);
  }
  return Array.from(map.entries()).map(([rate, value]) => ({
    rate,
    net: value.net,
    tax: value.tax,
  }));
};
