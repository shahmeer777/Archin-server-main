import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: Number, ref: 'User', required: true, unique: true },

  // Step 1
  type_bien: { type: String, default: '' },
  statut_bien: { type: String, default: '' },
  autres_statut_text: { type: String, default: '' },

  // Step 2
  surface_interieure: { type: Number, default: 0 },
  surface_exterieure: { type: Number, default: 0 },
  nb_pieces: { type: Number, default: 0 },

  // Step 3
  objectifs: { type: [String], default: [] },
  problemes: { type: [String], default: [] },
  autre_probleme_text: { type: [String], default: [] },

  // Step 4
  budget_option: { type: String, default: '' },
  total_budget_estimate: { type: Number, default: 0 },

  // Step 5
  espaces: {
    type: [{
      value: { type: String, default: '' },
      total_m2: { type: Number, default: 0 },
      nb_pieces: { type: Number, default: 0 }
    }],
    default: []
  },

  // Step 6
  selected_styles: { type: [String], default: [] },

  // Step 7
  selected_colors: {
    type: [{
      hex: { type: String, default: '' },
      name: { type: String, default: '' }
    }],
    default: []
  },

  // Step 8
  selected_subjects: { type: [String], default: [] },

  // Step 9
  images_reactions: {
    type: [{
      imageUrl: { type: String, default: '' },
      reaction: {
        type: String,
        enum: ['like', 'love'],
        default: 'like'
      }
    }],
    default: []
  },

  // 🛒 WooCommerce Order Data
  orderId: { type: Number, default: 0 },
  status: { type: String, default: '' },
  total: { type: String, default: '' },
  currency: { type: String, default: '' },
  date: { type: Date, default: null },
  billing: {
    first_name: { type: String, default: '' },
    last_name: { type: String, default: '' },
    company: { type: String, default: '' },
    address_1: { type: String, default: '' },
    address_2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postcode: { type: String, default: '' },
    country: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  items: {
    type: [{
      id: { type: Number, default: 0 },
      name: { type: String, default: '' },
      product_id: { type: Number, default: 0 },
      variation_id: { type: Number, default: 0 },
      quantity: { type: Number, default: 0 },
      tax_class: { type: String, default: '' },
      subtotal: { type: String, default: '' },
      subtotal_tax: { type: String, default: '' },
      total: { type: String, default: '' },
      total_tax: { type: String, default: '' },
      taxes: { type: [mongoose.Schema.Types.Mixed], default: [] },
      meta_data: { type: [mongoose.Schema.Types.Mixed], default: [] },
      sku: { type: String, default: '' },
      price: { type: Number, default: 0 },
      image: {
        id: { type: String, default: '' },
        src: { type: String, default: '' }
      }
    }],
    default: []
  },

  // Mode de vie 1
  uploaded_images: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UploadedImage' }], default: [] },
  reference_links: { type: String, default: '' },

  // Mode de vie 2
  annee_construction: { type: String, default: '' },
  nombre_niveaux: { type: String, default: '' },
  numero_etage: { type: String, default: '' },

  // Mode de vie 3
  chauffage_actuel: { type: String, default: '' },
  changer_chauffage: { type: String, default: '' },
  chauffage_souhaite: { type: String, default: '' },

  // Mode de vie 4
  eau_chaude_actuelle: { type: String, default: '' },
  changer_eau_chaude: { type: String, default: '' },
  eau_chaude_souhaite: { type: String, default: '' },

  // Mode de vie 5
  frequence_cuisine: { type: String, default: '' },
  habitude_manger: { type: String, default: '' },

  // Mode de vie 6
  besoins_rangement: { type: Number, default: 0 },
  mon_style: { type: Number, default: 0 },

  // Mode de vie 7
  je_prefere: { type: String, default: '' },
  je_travaille: { type: String, default: '' },
  mon_teletravail: { type: String, default: '' },
  recois_clients_maison: { type: String, default: '' },
  encore_dans_ce_bien_range: { type: String, default: '' },

  // Mode de vie 8
  animaux: {
    type: [{
      value: { type: String, default: '' },
      animaux_compagnie_counter: { type: String, default: '' }
    }],
    default: []
  },
  ajouter_adultes: {
    type: [{
      gender: { type: String, default: '' },
      age: { type: Number, default: 0 }
    }],
    default: []
  },
  ajouter_enfants: {
    type: [{
      type_personne_enfant: { type: String, default: '' },
      sexe_personne_enfant: { type: String, default: '' },
      age_personne_enfant: { type: Number, default: 0 }
    }],
    default: []
  },
  nouvel_enfant: {
    type: [{
      type_personne_nouvel_enfant: { type: String, default: '' },
      sexe_personne_nouvel_enfant: { type: String, default: '' },
      age_personne_nouvel_enfant: { type: Number, default: 0 }
    }],
    default: []
  },

  // Besoins et envies
  mes_besoins_et_envies_1_selected_styles: { type: [String], default: [] },
  mes_besoins_et_envies_2_selected_styles: { type: [String], default: [] },
  mes_besoins_et_envies_3_selected_styles: { type: [String], default: [] },
  mes_besoins_et_envies_4_selected_styles: { type: [String], default: [] },
  mes_besoins_et_envies_5: {
    selected_styles: { type: [String], default: [] },
    selected_calpinages: { type: [String], default: [] }
  },
  mes_besoins_et_envies_6: {
    opening_types: { type: String, default: '' },
    selected_styles: { type: [String], default: [] },
    additional_details: { type: String, default: '' }
  },
 phase_2: {
    content: {
      type: mongoose.Schema.Types.Mixed, 
      default: {}
    },
    uploaded_images_mode1: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedImageMode1' }
    ],
    uploaded_images_cuisine: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedImageCuisine' }
    ],
    uploaded_images_chambre_oui2: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedImageChambreOui2' }
    ],
    uploaded_images_chambre2: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedImageChambre2' }
    ],
  },
  phase_3: {type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UploadedImage' }], default: [] },
  reminder48Sent: { type: Boolean, default: false },
  reminder72Sent: { type: Boolean, default: false },
  reminder5daysSent: { type: Boolean, default: false },
  reminder10daysSent: { type: Boolean, default: false },
  isProjectFinalizedAdmin: { type: Boolean, default: false },
  isProjectFinalizedUser: { type: Boolean, default: false }

}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
