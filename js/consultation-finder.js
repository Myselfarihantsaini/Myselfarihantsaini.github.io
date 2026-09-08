(() => {
  const form = document.getElementById('consultation-finder-form');
  if (!form) return;

  const consultants = {
    arihant: { name: 'Arihant', fullName: 'Arihant Saini', phone: '919057918251' },
    manasavi: { name: 'Manasavi', fullName: 'Manasavi', phone: '919079249680' },
    bhavita: { name: 'Bhavita', fullName: 'Bhavita', phone: '917014406101' }
  };
  const birthDetails = 'Your date, time, and place of birth, plus the areas of life you want to discuss.';
  const services = {
    chart: {
      title: 'Full Birth Chart Reading',
      description: 'Explore life direction, strengths, and your dasha timeline through a complete birth chart reading.',
      preparation: birthDetails,
      page: 'vedic-kundli-reading.html'
    },
    career: {
      title: 'Career & Govt Exams',
      description: 'Discuss a job change, exam plans, promotions, or business suitability through your birth chart and timing periods.',
      preparation: 'Your birth details, current work or study situation, and the decision or exam you want to discuss.',
      page: 'career-astrology-consultation.html'
    },
    marriage: {
      title: 'Marriage & Compatibility',
      description: 'Explore relationship patterns, marriage timing, or compatibility in the context of your chart.',
      preparation: 'Your birth details. For compatibility, have both people\'s birth details ready with their permission.',
      page: 'marriage-astrology-consultation.html'
    },
    question: {
      title: 'Mini Question Reading',
      description: 'A focused reading for one question. You can also ask about a One Question Audio Reply if you prefer an audio response.',
      preparation: 'One clear question and your birth details. Mention whether you prefer a short session or an audio reply.',
      page: 'consultation-process.html'
    },
    birth: {
      title: 'Birth Time Rectification / Chart Check',
      description: 'Discuss an uncertain birth time and whether a chart check or a more detailed rectification is appropriate.',
      preparation: 'Your known birth date and place, an approximate time range, and dates of significant life events. Mention if the birth date is also uncertain.',
      page: 'consultation-process.html'
    },
    vastu: {
      title: 'Vastu Consultation',
      description: 'Talk with Bhavita about your home or workspace, room placement, entrance, and practical Vastu remedies.',
      preparation: 'A floor plan if available, the entrance direction, and the concerns you have about your space.',
      page: 'vastu-consultation.html'
    }
  };
  const concern = document.getElementById('finder-concern');
  const consultant = document.getElementById('finder-consultant');
  const question = document.getElementById('finder-question');
  const booking = document.getElementById('finder-book');

  function selection() {
    const personKey = concern.value === 'vastu' ? 'bhavita' : concern.value === 'chart' ? consultant.value : 'arihant';
    const service = { ...services[concern.value] };
    if (personKey === 'manasavi') {
      service.title = 'Kundali Prediction';
      service.description = 'Explore focused life questions, chart promise, and timing with Manasavi.';
      service.page = 'contact.html';
    }
    return { person: consultants[personKey], service };
  }

  function updateEnquiry() {
    const { person, service } = selection();
    const message = [
      `Hi ${person.name}, I found Shambhavaa's consultation finder and would like to enquire about ${service.title}.`,
      question.value.trim() ? `My question: ${question.value.trim()}` : '',
      'Please share the fees, session format, and next available appointment.'
    ].filter(Boolean).join('\n\n');
    booking.href = `https://wa.me/${person.phone}?text=${encodeURIComponent(message)}`;
  }

  function updateRecommendation() {
    const { person, service } = selection();
    document.getElementById('finder-consultant-field').hidden = concern.value !== 'chart';
    document.getElementById('finder-service').textContent = service.title;
    document.getElementById('finder-person').textContent = `With ${person.fullName}`;
    document.getElementById('finder-description').textContent = service.description;
    document.getElementById('finder-preparation').textContent = service.preparation;
    document.getElementById('finder-detail').href = service.page;
    booking.textContent = `Enquire with ${person.name} on WhatsApp`;
    updateEnquiry();
  }

  form.addEventListener('submit', event => event.preventDefault());
  concern.addEventListener('change', updateRecommendation);
  consultant.addEventListener('change', updateRecommendation);
  question.addEventListener('input', updateEnquiry);
  updateRecommendation();
  form.hidden = false;
})();
