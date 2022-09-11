import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import InfiniteScroll from 'infinite-scroll ';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const key = '29773664-bbac3ad1105fd49531e6a6409';

const divEl = document.querySelector('.gallery');
const formEl = document.querySelector('.search-form');
const loadMoreLoader = document.querySelector('.load-more');

let searchQuery = '';
let page = 1;
let limit = 40;
let totalPages;

const baseUrl = `https://pixabay.com/api/?key=29773664-bbac3ad1105fd49531e6a6409`;
const options = `&image_type=photo&orientation=horizontal&safesearch=true`;

formEl.addEventListener('submit', onSubmit);

async function fetchImages(text) {
  return await axios.get(
    `${baseUrl}&q=${text}${options}&page=${page}&per_page=${limit}`
  );
}

function onSubmit(evt) {
  evt.preventDefault();
  loadMoreLoader.classList.add('hiden');

  searchQuery = evt.currentTarget.elements.searchQuery.value;
  if (searchQuery === '') {
    Notify.warning('Enter something');
    return;
  }
  page = 1;
  responseProcessing(searchQuery);
}

async function loadMore(evt) {
  try {
    if (totalPages < page) {
      return;
    }
    page += 1;
    const data = await fetchImages(searchQuery);
    totalPages = data.data.totalHits / limit;
    if (totalPages <= page) {
      Notify.warning(
        "We're sorry, but you've reached the end of search results"
      );
      loadMoreLoader.classList.add('hiden');
      window.removeEventListener('scroll', loadMore());
      return;
    }
    markupAdd(data.data.hits);
  } catch (error) {
    console.log(error.message);
  }
}

async function responseProcessing(text) {
  try {
    const data = await fetchImages(text);
    divEl.innerHTML = '';

    Notify.info(`Hooray! We found ${data.data.totalHits} images`);

    if (data.data.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again'
      );
      return;
    }
    markupAdd(data.data.hits);
    loadMoreLoader.classList.remove('hiden');
  } catch (error) {
    console.log(error.message);
  }
}

function markupAdd(datas) {
  const markup = datas
    .map(data => {
      return `
      <div class="photo-card">
      <a class="photo-item" href=${data.largeImageURL} >
  <img class="gallery__image" src=${data.webformatURL} alt="" loading="lazy" width=640 height=426 />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes ${data.likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${data.views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${data.comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${data.downloads}</b>
    </p>
  </div>
</div >
`;
    })
    .join('');
  divEl.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
  smoothScroll();
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

var lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

window.addEventListener('scroll', () => {
  const documentRect = document.documentElement.getBoundingClientRect();
  if (documentRect.bottom < document.documentElement.clientHeight + 5) {
    loadMore();
  }
});
