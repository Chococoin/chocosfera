const fs = require('fs');
const path = require('path');

const translations = {
  fr: {
    forms: {
      consentText: "J'accepte de recevoir des emails marketing et liés au projet de Chocosfera SRL. Je comprends que je peux me désinscrire à tout moment.",
      name: "Nom",
      email: "Email",
      country: "Pays",
      subject: "Sujet",
      message: "Message",
      submitting: "Envoi en cours...",
      required: "Champ requis"
    },
    newsletter: {
      title: "Rejoignez la Newsletter de Chocósfera",
      subtitle: "Recevez des mises à jour sur notre chocolat, les adoptions d'arbres et la transparence blockchain.",
      button: "S'abonner",
      success: "Vous faites maintenant partie de la communauté Chocósfera!",
      successMessage: "Vérifiez votre email pour confirmer votre abonnement.",
      subscribeAnother: "Abonner un autre email"
    },
    adopt: {
      title: "Adoptez un Cacaoyer",
      subtitle: "Soutenez les agriculteurs et obtenez des retours annuels de cacao d'origine éthique.",
      numberOfTrees: "Nombre d'Arbres",
      pricePerTree: "€30/arbre/an",
      button: "Adopter Maintenant",
      success: "Merci, {name}!",
      successMessage: "Votre adoption est confirmée. Vérifiez votre email pour les prochaines étapes.",
      treesAdopted: "Arbres adoptés",
      annualCost: "Coût annuel",
      adoptMore: "Adopter plus d'arbres"
    },
    contact: {
      title: "Contactez Chocósfera",
      subtitle: "Entrez en contact avec notre équipe.",
      button: "Envoyer le Message",
      success: "Merci!",
      successMessage: "Nous vous répondrons bientôt.",
      sendAnother: "Envoyer un autre message"
    }
  },
  de: {
    forms: {
      consentText: "Ich stimme zu, Marketing- und projektbezogene E-Mails von Chocosfera SRL zu erhalten. Ich verstehe, dass ich mich jederzeit abmelden kann.",
      name: "Name",
      email: "E-Mail",
      country: "Land",
      subject: "Betreff",
      message: "Nachricht",
      submitting: "Wird gesendet...",
      required: "Pflichtfeld"
    },
    newsletter: {
      title: "Abonnieren Sie den Chocósfera Newsletter",
      subtitle: "Erhalten Sie Updates über unsere Schokolade, Baumadoptionen und Blockchain-Transparenz.",
      button: "Abonnieren",
      success: "Sie sind jetzt Teil der Chocósfera-Community!",
      successMessage: "Überprüfen Sie Ihre E-Mail, um Ihr Abonnement zu bestätigen.",
      subscribeAnother: "Weitere E-Mail abonnieren"
    },
    adopt: {
      title: "Adoptieren Sie einen Kakaobaum",
      subtitle: "Unterstützen Sie Bauern und erhalten Sie jährliche Erträge aus ethisch bezogenem Kakao.",
      numberOfTrees: "Anzahl der Bäume",
      pricePerTree: "€30/Baum/Jahr",
      button: "Jetzt Adoptieren",
      success: "Danke, {name}!",
      successMessage: "Ihre Adoption ist bestätigt. Überprüfen Sie Ihre E-Mail für die nächsten Schritte.",
      treesAdopted: "Adoptierte Bäume",
      annualCost: "Jährliche Kosten",
      adoptMore: "Mehr Bäume adoptieren"
    },
    contact: {
      title: "Kontaktieren Sie Chocósfera",
      subtitle: "Kontaktieren Sie unser Team.",
      button: "Nachricht Senden",
      success: "Danke!",
      successMessage: "Wir werden uns bald bei Ihnen melden.",
      sendAnother: "Eine weitere Nachricht senden"
    }
  },
  it: {
    forms: {
      consentText: "Accetto di ricevere email di marketing e relative al progetto da Chocosfera SRL. Comprendo di potermi disiscrivere in qualsiasi momento.",
      name: "Nome",
      email: "Email",
      country: "Paese",
      subject: "Oggetto",
      message: "Messaggio",
      submitting: "Invio in corso...",
      required: "Campo obbligatorio"
    },
    newsletter: {
      title: "Iscriviti alla Newsletter di Chocósfera",
      subtitle: "Ricevi aggiornamenti sul nostro cioccolato, adozioni di alberi e trasparenza blockchain.",
      button: "Iscriviti",
      success: "Ora fai parte della comunità Chocósfera!",
      successMessage: "Controlla la tua email per confermare l'iscrizione.",
      subscribeAnother: "Iscrivere un'altra email"
    },
    adopt: {
      title: "Adotta un Albero di Cacao",
      subtitle: "Sostieni gli agricoltori e ottieni ritorni annuali da cacao di origine etica.",
      numberOfTrees: "Numero di Alberi",
      pricePerTree: "€30/albero/anno",
      button: "Adotta Ora",
      success: "Grazie, {name}!",
      successMessage: "La tua adozione è confermata. Controlla la tua email per i prossimi passi.",
      treesAdopted: "Alberi adottati",
      annualCost: "Costo annuale",
      adoptMore: "Adotta più alberi"
    },
    contact: {
      title: "Contatta Chocósfera",
      subtitle: "Mettiti in contatto con il nostro team.",
      button: "Invia Messaggio",
      success: "Grazie!",
      successMessage: "Ti risponderemo presto.",
      sendAnother: "Invia un altro messaggio"
    }
  },
  pt: {
    forms: {
      consentText: "Concordo em receber emails de marketing e relacionados ao projeto da Chocosfera SRL. Entendo que posso cancelar a inscrição a qualquer momento.",
      name: "Nome",
      email: "Email",
      country: "País",
      subject: "Assunto",
      message: "Mensagem",
      submitting: "Enviando...",
      required: "Campo obrigatório"
    },
    newsletter: {
      title: "Junte-se à Newsletter da Chocósfera",
      subtitle: "Receba atualizações sobre nosso chocolate, adoções de árvores e transparência blockchain.",
      button: "Inscrever-se",
      success: "Você agora faz parte da comunidade Chocósfera!",
      successMessage: "Verifique seu email para confirmar sua inscrição.",
      subscribeAnother: "Inscrever outro email"
    },
    adopt: {
      title: "Adote uma Árvore de Cacau",
      subtitle: "Apoie agricultores e obtenha retornos anuais de cacau de origem ética.",
      numberOfTrees: "Número de Árvores",
      pricePerTree: "€30/árvore/ano",
      button: "Adotar Agora",
      success: "Obrigado, {name}!",
      successMessage: "Sua adoção está confirmada. Verifique seu email para os próximos passos.",
      treesAdopted: "Árvores adotadas",
      annualCost: "Custo anual",
      adoptMore: "Adotar mais árvores"
    },
    contact: {
      title: "Contacte a Chocósfera",
      subtitle: "Entre em contato com nossa equipe.",
      button: "Enviar Mensagem",
      success: "Obrigado!",
      successMessage: "Responderemos em breve.",
      sendAnother: "Enviar outra mensagem"
    }
  },
  ro: {
    forms: {
      consentText: "Sunt de acord să primesc emailuri de marketing și legate de proiect de la Chocosfera SRL. Înțeleg că mă pot dezabona oricând.",
      name: "Nume",
      email: "Email",
      country: "Țară",
      subject: "Subiect",
      message: "Mesaj",
      submitting: "Se trimite...",
      required: "Câmp obligatoriu"
    },
    newsletter: {
      title: "Alăturați-vă Newsletter-ului Chocósfera",
      subtitle: "Primiți actualizări despre ciocolata noastră, adoptările de copaci și transparența blockchain.",
      button: "Abonează-te",
      success: "Acum faceți parte din comunitatea Chocósfera!",
      successMessage: "Verificați emailul pentru a confirma abonamentul.",
      subscribeAnother: "Abonați alt email"
    },
    adopt: {
      title: "Adoptă un Copac de Cacao",
      subtitle: "Sprijiniți fermierii și obțineți randamente anuale din cacao de origine etică.",
      numberOfTrees: "Număr de Copaci",
      pricePerTree: "€30/copac/an",
      button: "Adoptă Acum",
      success: "Mulțumesc, {name}!",
      successMessage: "Adopția ta este confirmată. Verifică emailul pentru pașii următori.",
      treesAdopted: "Copaci adoptați",
      annualCost: "Cost anual",
      adoptMore: "Adoptă mai mulți copaci"
    },
    contact: {
      title: "Contactați Chocósfera",
      subtitle: "Luați legătura cu echipa noastră.",
      button: "Trimite Mesaj",
      success: "Mulțumim!",
      successMessage: "Vă vom răspunde în curând.",
      sendAnother: "Trimite alt mesaj"
    }
  },
  ja: {
    forms: {
      consentText: "Chocosfera SRLからのマーケティングおよびプロジェクト関連のメールの受信に同意します。いつでも配信停止できることを理解しています。",
      name: "名前",
      email: "メール",
      country: "国",
      subject: "件名",
      message: "メッセージ",
      submitting: "送信中...",
      required: "必須項目"
    },
    newsletter: {
      title: "Chocósferaニュースレターに登録",
      subtitle: "チョコレート、木の養子縁組、ブロックチェーンの透明性に関する最新情報を受け取る。",
      button: "購読する",
      success: "Chocósferaコミュニティの一員になりました！",
      successMessage: "購読を確認するためにメールをご確認ください。",
      subscribeAnother: "別のメールを購読する"
    },
    adopt: {
      title: "カカオの木を養子にする",
      subtitle: "農家を支援し、倫理的に調達されたカカオから年間収益を得る。",
      numberOfTrees: "木の数",
      pricePerTree: "€30/木/年",
      button: "今すぐ養子縁組",
      success: "ありがとう、{name}！",
      successMessage: "養子縁組が確認されました。次のステップについてはメールをご確認ください。",
      treesAdopted: "養子にした木",
      annualCost: "年間費用",
      adoptMore: "もっと木を養子にする"
    },
    contact: {
      title: "Chocósferaに連絡",
      subtitle: "チームにお問い合わせください。",
      button: "メッセージを送信",
      success: "ありがとうございます！",
      successMessage: "すぐにご連絡いたします。",
      sendAnother: "別のメッセージを送信"
    }
  },
  zh: {
    forms: {
      consentText: "我同意接收来自Chocosfera SRL的营销和项目相关电子邮件。我理解我可以随时取消订阅。",
      name: "姓名",
      email: "邮箱",
      country: "国家",
      subject: "主题",
      message: "消息",
      submitting: "提交中...",
      required: "必填字段"
    },
    newsletter: {
      title: "订阅Chocósfera新闻通讯",
      subtitle: "接收有关我们的巧克力、树木领养和区块链透明度的更新。",
      button: "订阅",
      success: "您现在是Chocósfera社区的一员！",
      successMessage: "查看您的电子邮件以确认订阅。",
      subscribeAnother: "订阅另一个邮箱"
    },
    adopt: {
      title: "领养可可树",
      subtitle: "支持农民并从道德采购的可可中获得年度回报。",
      numberOfTrees: "树的数量",
      pricePerTree: "€30/树/年",
      button: "立即领养",
      success: "谢谢你，{name}！",
      successMessage: "您的领养已确认。查看您的电子邮件了解后续步骤。",
      treesAdopted: "已领养的树",
      annualCost: "年度费用",
      adoptMore: "领养更多树"
    },
    contact: {
      title: "联系Chocósfera",
      subtitle: "与我们的团队取得联系。",
      button: "发送消息",
      success: "谢谢！",
      successMessage: "我们会尽快回复您。",
      sendAnother: "发送另一条消息"
    }
  }
};

const messagesDir = path.join(__dirname, '..', 'messages');

Object.entries(translations).forEach(([lang, content]) => {
  const filePath = path.join(messagesDir, `${lang}.json`);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(fileContent);

    // Add new translations
    json.forms = content.forms;
    json.newsletter = content.newsletter;
    json.adopt = content.adopt;
    json.contact = content.contact;

    // Write back
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    console.log(`✅ Updated ${lang}.json`);
  } catch (error) {
    console.error(`❌ Error updating ${lang}.json:`, error.message);
  }
});

console.log('✅ All translation files updated!');
